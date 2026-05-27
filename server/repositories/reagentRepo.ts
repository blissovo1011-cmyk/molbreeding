import { getDb } from '../db.js';
import { v4 as uuid } from 'uuid';
import type { Reagent, ReagentCreateDTO, ReagentUpdateDTO, ReagentWarehouse, ReagentSyncConfig, ProductStatus, SubSystem } from '../types.js';

function rowToReagent(row: any, warehouses: ReagentWarehouse[], syncConfigs: ReagentSyncConfig[]): Reagent {
  const mainlandCfg = syncConfigs.find(c => c.system === 'mainland');
  const overseasCfg = syncConfigs.find(c => c.system === 'overseas');
  return {
    ...row,
    syncMainland: !!row.syncMainland,
    syncOverseas: !!row.syncOverseas,
    warehouses,
    mainlandConfig: mainlandCfg
      ? { alertValue: mainlandCfg.alertValue!, warehouse: mainlandCfg.warehouse!, kingdeeCode: mainlandCfg.kingdeeCode!, status: mainlandCfg.status }
      : undefined,
    overseasConfig: overseasCfg
      ? { alertValue: overseasCfg.alertValue!, warehouse: overseasCfg.warehouse!, kingdeeCode: overseasCfg.kingdeeCode!, localName: overseasCfg.localName!, status: overseasCfg.status }
      : undefined,
  };
}

function getWarehouses(reagentId: string): ReagentWarehouse[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reagent_warehouses WHERE reagentId = ?').all(reagentId) as ReagentWarehouse[];
}

function getSyncConfigs(reagentId: string): ReagentSyncConfig[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reagent_sync_configs WHERE reagentId = ?').all(reagentId) as ReagentSyncConfig[];
}

export function findAll(options?: { system?: SubSystem }): Reagent[] {
  const db = getDb();
  const conditions: string[] = [];
  if (options?.system === 'mainland') conditions.push(`syncMainland = 1`);
  else if (options?.system === 'overseas') conditions.push(`syncOverseas = 1`);

  let sql = 'SELECT * FROM reagents';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY createdAt DESC';

  const rows = db.prepare(sql).all() as any[];
  return rows.map((row) => {
    const warehouses = getWarehouses(row.id);
    const syncConfigs = getSyncConfigs(row.id);
    return rowToReagent(row, warehouses, syncConfigs);
  });
}

export function findById(id: string): Reagent | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM reagents WHERE id = ?').get(id) as any;
  if (!row) return null;
  const warehouses = getWarehouses(id);
  const syncConfigs = getSyncConfigs(id);
  return rowToReagent(row, warehouses, syncConfigs);
}

export function create(data: ReagentCreateDTO): Reagent {
  const db = getDb();
  const id = uuid();

  const insertReagent = db.prepare(
    `INSERT INTO reagents (id, category, name, productId, spec, status, syncMainland, syncOverseas) VALUES (?,?,?,?,?,'Pending',0,0)`
  );
  const insertWarehouse = db.prepare(
    `INSERT INTO reagent_warehouses (id, reagentId, warehouse, itemNo, kingdeeCode) VALUES (?,?,?,?,?)`
  );

  const transaction = db.transaction(() => {
    insertReagent.run(id, data.category, data.name, data.productId, data.spec);
    for (const wh of data.warehouses) {
      insertWarehouse.run(uuid(), id, wh.warehouse, wh.itemNo, wh.kingdeeCode);
    }
  });

  transaction();
  return findById(id)!;
}

export function update(id: string, data: ReagentUpdateDTO): Reagent | null {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM reagents WHERE id = ?').get(id);
  if (!existing) return null;

  const { warehouses, ...fields } = data;
  const entries = Object.entries(fields).filter(([_, v]) => v !== undefined);

  const transaction = db.transaction(() => {
    if (entries.length > 0) {
      const setClauses: string[] = [];
      const params: any[] = [];
      for (const [key, value] of entries) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
      setClauses.push(`updatedAt = datetime('now')`);
      params.push(id);
      db.prepare(`UPDATE reagents SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
    } else {
      db.prepare(`UPDATE reagents SET updatedAt = datetime('now') WHERE id = ?`).run(id);
    }

    if (warehouses) {
      db.prepare(`DELETE FROM reagent_warehouses WHERE reagentId = ?`).run(id);
      const insertWh = db.prepare(
        `INSERT INTO reagent_warehouses (id, reagentId, warehouse, itemNo, kingdeeCode) VALUES (?,?,?,?,?)`
      );
      for (const wh of warehouses) {
        insertWh.run(uuid(), id, wh.warehouse, wh.itemNo, wh.kingdeeCode);
      }
    }
  });

  transaction();
  return findById(id)!;
}

export function updateStatus(id: string, status: ProductStatus): void {
  const db = getDb();
  db.prepare(`UPDATE reagents SET status = ?, updatedAt = datetime('now') WHERE id = ?`).run(status, id);
}

export function updateSyncFields(id: string, fields: { syncMainland?: boolean; syncOverseas?: boolean }): void {
  const db = getDb();
  const setClauses: string[] = [`updatedAt = datetime('now')`];
  const params: any[] = [];
  if (fields.syncMainland !== undefined) { setClauses.push(`syncMainland = ?`); params.push(fields.syncMainland ? 1 : 0); }
  if (fields.syncOverseas !== undefined) { setClauses.push(`syncOverseas = ?`); params.push(fields.syncOverseas ? 1 : 0); }
  params.push(id);
  db.prepare(`UPDATE reagents SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
}

export function remove(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM reagent_sync_configs WHERE reagentId = ?').run(id);
  db.prepare('DELETE FROM reagent_warehouses WHERE reagentId = ?').run(id);
  const result = db.prepare('DELETE FROM reagents WHERE id = ?').run(id);
  return result.changes > 0;
}
