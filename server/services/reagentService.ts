import { NotFoundError, ValidationError } from '../errors.js';
import * as reagentRepo from '../repositories/reagentRepo.js';
import * as productRepo from '../repositories/productRepo.js';
import * as syncConfigRepo from '../repositories/syncConfigRepo.js';
import type { Reagent, ReagentCreateDTO, ReagentUpdateDTO, SubSystem } from '../types.js';

export function listReagents(options?: { system?: SubSystem }): Reagent[] {
  return reagentRepo.findAll(options);
}

export function getReagent(id: string): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  return reagent;
}

export function createReagent(data: ReagentCreateDTO): Reagent {
  for (const field of ['category', 'name', 'productId', 'spec'] as const) {
    if (!(data as any)[field]) throw new ValidationError(`Missing required field: ${field}`);
  }
  if (!Array.isArray(data.warehouses) || data.warehouses.length === 0) throw new ValidationError('warehouses must be a non-empty array');

  const product = productRepo.findById(data.productId);
  if (!product || product.status !== 'Effective') throw new ValidationError('试剂仅能关联已生效的产品');

  return reagentRepo.create(data);
}

export function updateReagent(id: string, data: ReagentUpdateDTO): Reagent {
  const reagent = reagentRepo.update(id, data);
  if (!reagent) throw new NotFoundError('Reagent');
  return reagent;
}

export function publishReagent(id: string, data?: { syncMainland?: boolean; syncOverseas?: boolean; mainlandConfig?: { alertValue: number }; overseasConfig?: { alertValue: number; localName: string } }): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  if (reagent.status === 'Effective') throw new ValidationError('已在售的试剂无需重复上架');
  reagentRepo.updateStatus(id, 'Effective');

  // Handle sync config if provided
  if (data) {
    const { syncMainland, syncOverseas, mainlandConfig, overseasConfig } = data;
    if (syncMainland || syncOverseas) {
      reagentRepo.updateSyncFields(id, { syncMainland: !!syncMainland, syncOverseas: !!syncOverseas });
    }
    if (syncMainland && mainlandConfig) {
      syncConfigRepo.upsert(id, 'mainland', { alertValue: mainlandConfig.alertValue, status: 'Effective' });
    }
    if (syncOverseas && overseasConfig) {
      syncConfigRepo.upsert(id, 'overseas', { alertValue: overseasConfig.alertValue, localName: overseasConfig.localName, status: 'Effective' });
    }
  }

  return reagentRepo.findById(id)!;
}

export function offlineReagent(id: string, data?: { offlineReason?: string }): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  if (reagent.status !== 'Effective') throw new ValidationError('只有在售状态的试剂可以下架');
  reagentRepo.updateStatus(id, 'Obsolete');

  // Always sync offline to mainland and overseas
  if (reagent.syncMainland) {
    syncConfigRepo.updateStatus(id, 'mainland', 'Obsolete');
  }
  if (reagent.syncOverseas) {
    syncConfigRepo.updateStatus(id, 'overseas', 'Obsolete');
  }

  return reagentRepo.findById(id)!;
}

export function deleteReagent(id: string): void {
  const reagent = reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  reagentRepo.remove(id);
}
