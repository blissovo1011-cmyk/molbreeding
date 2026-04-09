import { NotFoundError, ValidationError } from '../errors.js';
import * as reagentRepo from '../repositories/reagentRepo.js';
import * as productRepo from '../repositories/productRepo.js';
import type { Reagent, ReagentCreateDTO, ReagentUpdateDTO, SubSystem } from '../types.js';

export async function listReagents(options?: { system?: SubSystem }): Promise<Reagent[]> {
  return reagentRepo.findAll(options);
}

export async function getReagent(id: string): Promise<Reagent> {
  const reagent = await reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  return reagent;
}

export async function createReagent(data: ReagentCreateDTO): Promise<Reagent> {
  for (const field of ['category', 'name', 'productId', 'spec'] as const) {
    if (!(data as any)[field]) throw new ValidationError(`Missing required field: ${field}`);
  }
  if (!Array.isArray(data.warehouses) || data.warehouses.length === 0) throw new ValidationError('warehouses must be a non-empty array');

  const product = await productRepo.findById(data.productId);
  if (!product || product.status !== 'Effective') throw new ValidationError('试剂仅能关联已生效的产品');

  return reagentRepo.create(data);
}

export async function updateReagent(id: string, data: ReagentUpdateDTO): Promise<Reagent> {
  const reagent = await reagentRepo.update(id, data);
  if (!reagent) throw new NotFoundError('Reagent');
  return reagent;
}

export async function publishReagent(id: string): Promise<Reagent> {
  const reagent = await reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  if (reagent.status !== 'Pending') throw new ValidationError('只有待定状态的试剂可以上架');
  await reagentRepo.updateStatus(id, 'Effective');
  return (await reagentRepo.findById(id))!;
}

export async function offlineReagent(id: string): Promise<Reagent> {
  const reagent = await reagentRepo.findById(id);
  if (!reagent) throw new NotFoundError('Reagent');
  if (reagent.status !== 'Effective') throw new ValidationError('只有在售状态的试剂可以下架');
  await reagentRepo.updateStatus(id, 'Obsolete');
  return (await reagentRepo.findById(id))!;
}
