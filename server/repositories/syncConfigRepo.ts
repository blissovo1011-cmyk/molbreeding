import { getDb } from '../db';
import { v4 as uuid } from 'uuid';
import type { ReagentSyncConfig, ProductStatus, SubSystem } from '../types';

export function findByReagentId(reagentId: string): ReagentSyncConfig[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reagent_sync_configs WHERE reagentId = ?').all(reagentId) as ReagentSyncConfig[];
}

export function findByReagentAndSystem(reagentId: string, system: SubSystem): ReagentSyncConfig | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM reagent_sync_configs WHERE reagentId = ? AND system = ?').get(reagentId, system) as ReagentSyncConfig | undefined;
  return row ?? null;
}

export function upsert(
  reagentId: string,
  system: SubSystem,
  data: { alertValue?: number; warehouse?: string; kingdeeCode?: string; localName?: string; status?: ProductStatus }
): ReagentSyncConfig {
  const db = getDb();
  const existing = findByReagentAndSystem(reagentId, system);

  if (existing) {
    const setClauses: string[] = [];
    const params: any[] = [];

    if (data.alertValue !== undefined) { setClauses.push('alertValue = ?'); params.push(data.alertValue); }
    if (data.warehouse !== undefined) { setClauses.push('warehouse = ?'); params.push(data.warehouse); }
    if (data.kingdeeCode !== undefined) { setClauses.push('kingdeeCode = ?'); params.push(data.kingdeeCode); }
    if (data.localName !== undefined) { setClauses.push('localName = ?'); params.push(data.localName); }
    if (data.status !== undefined) { setClauses.push('status = ?'); params.push(data.status); }

    if (setClauses.length > 0) {
      params.push(reagentId, system);
      db.prepare(`UPDATE reagent_sync_configs SET ${setClauses.join(', ')} WHERE reagentId = ? AND system = ?`).run(...params);
    }

    return findByReagentAndSystem(reagentId, system)!;
  }

  // Insert new record
  const id = uuid();
  const status = data.status ?? 'Pending';

  db.prepare(`
    INSERT INTO reagent_sync_configs (id, reagentId, system, alertValue, warehouse, kingdeeCode, localName, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, reagentId, system, data.alertValue ?? null, data.warehouse ?? null, data.kingdeeCode ?? null, data.localName ?? null, status);

  return findByReagentAndSystem(reagentId, system)!;
}

export function updateStatus(reagentId: string, system: SubSystem, status: ProductStatus): void {
  const db = getDb();
  db.prepare('UPDATE reagent_sync_configs SET status = ? WHERE reagentId = ? AND system = ?').run(status, reagentId, system);
}
