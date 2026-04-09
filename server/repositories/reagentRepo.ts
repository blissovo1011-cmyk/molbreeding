import { query, queryOne, execute, getPool } from '../db.js';
import { v4 as uuid } from 'uuid';
import type { Reagent, ReagentCreateDTO, ReagentUpdateDTO, ReagentWarehouse, ReagentSyncConfig, ProductStatus, SubSystem } from '../types.js';

function rowToReagent(row: any, warehouses: ReagentWarehouse[], syncConfigs: ReagentSyncConfig[]): Reagent {
  const mainlandCfg = syncConfigs.find(c => c.system === 'mainland');
  const overseasCfg = syncConfigs.find(c => c.system === 'overseas');
  return {
    ...row,
    warehouses,
    mainlandConfig: mainlandCfg
      ? { alertValue: mainlandCfg.alertValue!, warehouse: mainlandCfg.warehouse!, kingdeeCode: mainlandCfg.kingdeeCode!, status: mainlandCfg.status }
      : undefined,
    overseasConfig: overseasCfg
      ? { alertValue: overseasCfg.alertValue!, warehouse: overseasCfg.warehouse!, kingdeeCode: overseasCfg.kingdeeCode!, localName: overseasCfg.localName!, status: overseasCfg.status }
      : undefined,
  };
}

async function getWarehouses(reagentId: string): Promise<ReagentWarehouse[]> {
  return query('SELECT * FROM reagent_warehouses WHERE "reagentId" = $1', [reagentId]);
}

async function getSyncConfigs(reagentId: string): Promise<ReagentSyncConfig[]> {
  return query('SELECT * FROM reagent_sync_configs WHERE "reagentId" = $1', [reagentId]);
}

export async function findAll(options?: { system?: SubSystem }): Promise<Reagent[]> {
  const conditions: string[] = [];
  if (options?.system === 'mainland') conditions.push(`"syncMainland" = true`);
  else if (options?.system === 'overseas') conditions.push(`"syncOverseas" = true`);

  let sql = 'SELECT * FROM reagents';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY "createdAt" DESC';

  const rows = await query(sql);
  return Promise.all(rows.map(async (row) => {
    const warehouses = await getWarehouses(row.id);
    const syncConfigs = await getSyncConfigs(row.id);
    return rowToReagent(row, warehouses, syncConfigs);
  }));
}

export async function findById(id: string): Promise<Reagent | null> {
  const row = await queryOne('SELECT * FROM reagents WHERE id = $1', [id]);
  if (!row) return null;
  const warehouses = await getWarehouses(id);
  const syncConfigs = await getSyncConfigs(id);
  return rowToReagent(row, warehouses, syncConfigs);
}

export async function create(data: ReagentCreateDTO): Promise<Reagent> {
  const id = uuid();
  await execute(
    `INSERT INTO reagents (id, category, name, "productId", spec, status, "syncMainland", "syncOverseas") VALUES ($1,$2,$3,$4,$5,'Pending',false,false)`,
    [id, data.category, data.name, data.productId, data.spec]
  );
  for (const wh of data.warehouses) {
    await execute(
      `INSERT INTO reagent_warehouses (id, "reagentId", warehouse, "itemNo", "kingdeeCode") VALUES ($1,$2,$3,$4,$5)`,
      [uuid(), id, wh.warehouse, wh.itemNo, wh.kingdeeCode]
    );
  }
  return (await findById(id))!;
}

export async function update(id: string, data: ReagentUpdateDTO): Promise<Reagent | null> {
  const existing = await queryOne('SELECT id FROM reagents WHERE id = $1', [id]);
  if (!existing) return null;

  const { warehouses, ...fields } = data;
  const entries = Object.entries(fields).filter(([_, v]) => v !== undefined);

  if (entries.length > 0) {
    const setClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const [key, value] of entries) {
      setClauses.push(`"${key}" = $${idx++}`);
      params.push(value);
    }
    setClauses.push(`"updatedAt" = NOW()`);
    params.push(id);
    await execute(`UPDATE reagents SET ${setClauses.join(', ')} WHERE id = $${idx}`, params);
  } else {
    await execute(`UPDATE reagents SET "updatedAt" = NOW() WHERE id = $1`, [id]);
  }

  if (warehouses) {
    await execute(`DELETE FROM reagent_warehouses WHERE "reagentId" = $1`, [id]);
    for (const wh of warehouses) {
      await execute(
        `INSERT INTO reagent_warehouses (id, "reagentId", warehouse, "itemNo", "kingdeeCode") VALUES ($1,$2,$3,$4,$5)`,
        [uuid(), id, wh.warehouse, wh.itemNo, wh.kingdeeCode]
      );
    }
  }
  return (await findById(id))!;
}

export async function updateStatus(id: string, status: ProductStatus): Promise<void> {
  await execute(`UPDATE reagents SET status = $1, "updatedAt" = NOW() WHERE id = $2`, [status, id]);
}

export async function updateSyncFields(id: string, fields: { syncMainland?: boolean; syncOverseas?: boolean }): Promise<void> {
  const setClauses: string[] = [`"updatedAt" = NOW()`];
  const params: any[] = [];
  let idx = 1;
  if (fields.syncMainland !== undefined) { setClauses.push(`"syncMainland" = $${idx++}`); params.push(fields.syncMainland); }
  if (fields.syncOverseas !== undefined) { setClauses.push(`"syncOverseas" = $${idx++}`); params.push(fields.syncOverseas); }
  params.push(id);
  await execute(`UPDATE reagents SET ${setClauses.join(', ')} WHERE id = $${idx}`, params);
}

export async function remove(id: string): Promise<boolean> {
  await execute('DELETE FROM reagent_sync_configs WHERE "reagentId" = $1', [id]);
  await execute('DELETE FROM reagent_warehouses WHERE "reagentId" = $1', [id]);
  const count = await execute('DELETE FROM reagents WHERE id = $1', [id]);
  return count > 0;
}
