import { NotFoundError, ValidationError } from '../errors.js';
import * as productRepo from '../repositories/productRepo.js';
import * as reagentRepo from '../repositories/reagentRepo.js';
import * as syncConfigRepo from '../repositories/syncConfigRepo.js';
import type { Product, Reagent, SyncConfigDTO, ReagentSyncDTO, SubSystem } from '../types.js';

export async function updateProductSync(id: string, data: SyncConfigDTO): Promise<Product> {
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (data.syncMainland && !data.mainlandAlertValue) throw new ValidationError('开启大陆同步时必须提供 mainlandAlertValue');
  if (data.syncOverseas && !data.overseasAlertValue) throw new ValidationError('开启海外同步时必须提供 overseasAlertValue');

  const syncFields: Record<string, any> = { syncMainland: data.syncMainland, syncOverseas: data.syncOverseas };
  if (data.mainlandAlertValue !== undefined) syncFields.mainlandAlertValue = data.mainlandAlertValue;
  if (data.overseasAlertValue !== undefined) syncFields.overseasAlertValue = data.overseasAlertValue;
  if (data.syncMainland && !product.syncMainland) syncFields.mainlandStatus = product.status;
  if (data.syncOverseas && !product.syncOverseas) syncFields.overseasStatus = product.status;

  await productRepo.updateSyncFields(id, syncFields);
  return (await productRepo.findById(id))!;
}

export async function subPublishProduct(id: string, system: SubSystem): Promise<Product> {
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (system === 'mainland' && !product.syncMainland) throw new ValidationError('产品未同步到该子系统');
  if (system === 'overseas' && !product.syncOverseas) throw new ValidationError('产品未同步到该子系统');
  await productRepo.updateSyncFields(id, { [system === 'mainland' ? 'mainlandStatus' : 'overseasStatus']: 'Effective' });
  return (await productRepo.findById(id))!;
}

export async function subOfflineProduct(id: string, system: SubSystem): Promise<Product> {
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (system === 'mainland' && !product.syncMainland) throw new ValidationError('产品未同步到该子系统');
  if (system === 'overseas' && !product.syncOverseas) throw new ValidationError('产品未同步到该子系统');
  await productRepo.updateSyncFields(id, { [system === 'mainland' ? 'mainlandStatus' : 'overseasStatus']: 'Obsolete' });
  return (await productRepo.findById(id))!;
}

export async function updateReagentSync(id: string, data: ReagentSyncDTO): Promise<Reagent> {
  const reagent = await reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  if (data.syncOverseas && (!data.overseasConfig || !data.overseasConfig.localName)) throw new ValidationError('海外同步必须提供 localName');

  await reagentRepo.updateSyncFields(id, { syncMainland: data.syncMainland, syncOverseas: data.syncOverseas });

  if (data.syncMainland && data.mainlandConfig) {
    await syncConfigRepo.upsert(id, 'mainland', { alertValue: data.mainlandConfig.alertValue, warehouse: data.mainlandConfig.warehouse, kingdeeCode: data.mainlandConfig.kingdeeCode, status: reagent.status });
  }
  if (data.syncOverseas && data.overseasConfig) {
    await syncConfigRepo.upsert(id, 'overseas', { alertValue: data.overseasConfig.alertValue, warehouse: data.overseasConfig.warehouse, kingdeeCode: data.overseasConfig.kingdeeCode, localName: data.overseasConfig.localName, status: reagent.status });
  }
  return (await reagentRepo.findById(id))!;
}

export async function subPublishReagent(id: string, system: SubSystem): Promise<Reagent> {
  const reagent = await reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  const config = await syncConfigRepo.findByReagentAndSystem(id, system);
  if (!config) throw new ValidationError('试剂未同步到该子系统');
  await syncConfigRepo.updateStatus(id, system, 'Effective');
  return (await reagentRepo.findById(id))!;
}

export async function subOfflineReagent(id: string, system: SubSystem): Promise<Reagent> {
  const reagent = await reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  const config = await syncConfigRepo.findByReagentAndSystem(id, system);
  if (!config) throw new ValidationError('试剂未同步到该子系统');
  await syncConfigRepo.updateStatus(id, system, 'Obsolete');
  return (await reagentRepo.findById(id))!;
}
