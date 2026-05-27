import { NotFoundError, ValidationError } from '../errors.js';
import * as productRepo from '../repositories/productRepo.js';
import * as reagentRepo from '../repositories/reagentRepo.js';
import * as syncConfigRepo from '../repositories/syncConfigRepo.js';
import type { Product, Reagent, SyncConfigDTO, ReagentSyncDTO, SubSystem } from '../types.js';

export function updateProductSync(id: string, data: SyncConfigDTO): Product {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (data.syncMainland && !data.mainlandAlertValue) throw new ValidationError('开启大陆同步时必须提供 mainlandAlertValue');
  if (data.syncOverseas && !data.overseasAlertValue) throw new ValidationError('开启海外同步时必须提供 overseasAlertValue');

  const syncFields: Record<string, any> = { syncMainland: data.syncMainland, syncOverseas: data.syncOverseas };
  if (data.mainlandAlertValue !== undefined) syncFields.mainlandAlertValue = data.mainlandAlertValue;
  if (data.overseasAlertValue !== undefined) syncFields.overseasAlertValue = data.overseasAlertValue;
  if (data.syncMainland && !product.syncMainland) syncFields.mainlandStatus = product.status;
  if (data.syncOverseas && !product.syncOverseas) syncFields.overseasStatus = product.status;

  productRepo.updateSyncFields(id, syncFields);
  return productRepo.findById(id)!;
}

export function subPublishProduct(id: string, system: SubSystem): Product {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (system === 'mainland' && !product.syncMainland) throw new ValidationError('产品未同步到该子系统');
  if (system === 'overseas' && !product.syncOverseas) throw new ValidationError('产品未同步到该子系统');
  productRepo.updateSyncFields(id, { [system === 'mainland' ? 'mainlandStatus' : 'overseasStatus']: 'Effective' });
  return productRepo.findById(id)!;
}

export function subOfflineProduct(id: string, system: SubSystem): Product {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (system === 'mainland' && !product.syncMainland) throw new ValidationError('产品未同步到该子系统');
  if (system === 'overseas' && !product.syncOverseas) throw new ValidationError('产品未同步到该子系统');
  productRepo.updateSyncFields(id, { [system === 'mainland' ? 'mainlandStatus' : 'overseasStatus']: 'Obsolete' });
  return productRepo.findById(id)!;
}

export function updateReagentSync(id: string, data: ReagentSyncDTO): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  if (data.syncOverseas && (!data.overseasConfig || !data.overseasConfig.localName)) throw new ValidationError('海外同步必须提供 localName');

  reagentRepo.updateSyncFields(id, { syncMainland: data.syncMainland, syncOverseas: data.syncOverseas });

  if (data.syncMainland && data.mainlandConfig) {
    syncConfigRepo.upsert(id, 'mainland', { alertValue: data.mainlandConfig.alertValue, warehouse: data.mainlandConfig.warehouse, kingdeeCode: data.mainlandConfig.kingdeeCode, status: reagent.status });
  }
  if (data.syncOverseas && data.overseasConfig) {
    syncConfigRepo.upsert(id, 'overseas', { alertValue: data.overseasConfig.alertValue, warehouse: data.overseasConfig.warehouse, kingdeeCode: data.overseasConfig.kingdeeCode, localName: data.overseasConfig.localName, status: reagent.status });
  }
  return reagentRepo.findById(id)!;
}

export function subPublishReagent(id: string, system: SubSystem): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  const config = syncConfigRepo.findByReagentAndSystem(id, system);
  if (!config) throw new ValidationError('试剂未同步到该子系统');
  syncConfigRepo.updateStatus(id, system, 'Effective');
  return reagentRepo.findById(id)!;
}

export function subOfflineReagent(id: string, system: SubSystem): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  const config = syncConfigRepo.findByReagentAndSystem(id, system);
  if (!config) throw new ValidationError('试剂未同步到该子系统');
  syncConfigRepo.updateStatus(id, system, 'Obsolete');
  return reagentRepo.findById(id)!;
}
