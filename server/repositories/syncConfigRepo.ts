import { query, queryOne, execute } from '../db.js';
import { v4 as uuid } from 'uuid';
import type { ReagentSyncConfig, ProductStatus, SubSystem } from '../types.js';

export async function findByReagentId(reagentId: string): Promise<ReagentSyncConfig[]> {
  return query('SELECT * FROM reagent_sync_configs WHERE "reagentId" = $1', [reagentId]);
}

export async function findByReagentAndSystem(reagentId: string, system: SubSystem): Promise<ReagentSyncConfig | null> {
  return queryOne('SELECT * FROM reagent_sync_configs WHERE "reagentId" = $1 AND system = $2', [reagentId, system]);
}

export async function upsert(
  reagentId: string,
  system: SubSystem,
  data: { alertValue?: number; warehouse?: string; kingdeeCode?: string; localName?: string; status?: ProductStatus }
): Promise<ReagentSyncConfig> {
  const existing = await findByReagentAndSystem(reagentId, system);

  if (existing) {
    const setClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (data.alertValue !== undefined) { setClauses.push(`"alertValue" = $${idx++}`); params.push(data.alertValue); }
    if (data.warehouse !== undefined) { setClauses.push(`warehouse = $${idx++}`); params.push(data.warehouse); }
    if (data.kingdeeCode !== undefined) { setClauses.push(`"kingdeeCode" = $${idx++}`); params.push(data.kingdeeCode); }
    if (data.localName !== undefined) { setClauses.push(`"localName" = $${idx++}`); params.push(data.localName); }
    if (data.status !== undefined) { setClauses.push(`status = $${idx++}`); params.push(data.status); }
    if (setClauses.length > 0) {
      params.push(reagentId, system);
      await execute(`UPDATE reagent_sync_configs SET ${setClauses.join(', ')} WHERE "reagentId" = $${idx++} AND system = $${idx}`, params);
    }
    return (await findByReagentAndSystem(reagentId, system))!;
  }

  const id = uuid();
  const status = data.status ?? 'Pending';
  await execute(
    `INSERT INTO reagent_sync_configs (id, "reagentId", system, "alertValue", warehouse, "kingdeeCode", "localName", status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, reagentId, system, data.alertValue ?? null, data.warehouse ?? null, data.kingdeeCode ?? null, data.localName ?? null, status]
  );
  return (await findByReagentAndSystem(reagentId, system))!;
}

export async function updateStatus(reagentId: string, system: SubSystem, status: ProductStatus): Promise<void> {
  await execute(`UPDATE reagent_sync_configs SET status = $1 WHERE "reagentId" = $2 AND system = $3`, [status, reagentId, system]);
}
