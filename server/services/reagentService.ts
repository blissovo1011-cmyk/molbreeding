import { NotFoundError, ValidationError } from '../errors';
import * as reagentRepo from '../repositories/reagentRepo';
import * as productRepo from '../repositories/productRepo';
import type { Reagent, ReagentCreateDTO, ReagentUpdateDTO, SubSystem } from '../types';

const REQUIRED_FIELDS = ['category', 'name', 'productId', 'spec', 'warehouses'] as const;
const REQUIRED_WAREHOUSE_FIELDS = ['warehouse', 'itemNo', 'kingdeeCode'] as const;

export function listReagents(options?: { system?: SubSystem }): Reagent[] {
  return reagentRepo.findAll(options);
}

export function getReagent(id: string): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) {
    throw new NotFoundError('Reagent');
  }
  return reagent;
}

export function createReagent(data: ReagentCreateDTO): Reagent {
  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (field === 'warehouses') continue; // handled separately below
    const value = (data as any)[field];
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  // Validate warehouses is a non-empty array
  if (!Array.isArray(data.warehouses) || data.warehouses.length === 0) {
    throw new ValidationError('warehouses must be a non-empty array');
  }

  // Validate each warehouse entry has required fields
  for (const wh of data.warehouses) {
    for (const field of REQUIRED_WAREHOUSE_FIELDS) {
      if (!(wh as any)[field]) {
        throw new ValidationError(`Missing required warehouse field: ${field}`);
      }
    }
  }

  // Check product exists and is Effective
  const product = productRepo.findById(data.productId);
  if (!product || product.status !== 'Effective') {
    throw new ValidationError('试剂仅能关联已生效的产品');
  }

  return reagentRepo.create(data);
}

export function updateReagent(id: string, data: ReagentUpdateDTO): Reagent {
  const reagent = reagentRepo.update(id, data);
  if (!reagent) {
    throw new NotFoundError('Reagent');
  }
  return reagent;
}

export function publishReagent(id: string): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) {
    throw new NotFoundError('Reagent');
  }
  if (reagent.status !== 'Pending') {
    throw new ValidationError('只有待定状态的试剂可以上架');
  }
  reagentRepo.updateStatus(id, 'Effective');
  return reagentRepo.findById(id)!;
}

export function offlineReagent(id: string): Reagent {
  const reagent = reagentRepo.findById(id);
  if (!reagent) {
    throw new NotFoundError('Reagent');
  }
  if (reagent.status !== 'Effective') {
    throw new ValidationError('只有在售状态的试剂可以下架');
  }
  reagentRepo.updateStatus(id, 'Obsolete');
  return reagentRepo.findById(id)!;
}
