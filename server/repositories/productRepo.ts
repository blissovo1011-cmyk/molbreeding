import { getDb } from '../db.js';
import { v4 as uuid } from 'uuid';
import type { Product, ProductCreateDTO, ProductUpdateDTO, ProductStatus, SubSystem } from '../types.js';

function rowToProduct(row: any): Product {
  if (!row) return row;
  return {
    ...row,
    finalReport: !!row.finalReport,
    isLocusSecret: !!row.isLocusSecret,
    canUpgradeToNewVersion: !!row.canUpgradeToNewVersion,
    syncMainland: !!row.syncMainland,
    syncOverseas: !!row.syncOverseas,
    mainlandConfig: row.syncMainland
      ? { alertValue: row.mainlandAlertValue, status: row.mainlandStatus }
      : undefined,
    overseasConfig: row.syncOverseas
      ? { alertValue: row.overseasAlertValue, status: row.overseasStatus }
      : undefined,
  };
}

export function findAll(options?: { category?: string; system?: SubSystem }): Product[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.category) {
    conditions.push(`category = ?`);
    params.push(options.category);
  }
  if (options?.system === 'mainland') {
    conditions.push(`syncMainland = 1`);
  } else if (options?.system === 'overseas') {
    conditions.push(`syncOverseas = 1`);
  }

  let sql = 'SELECT * FROM products';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY createdAt DESC';

  const rows = db.prepare(sql).all(...params);
  return rows.map((row: any) => {
    const product = rowToProduct(row);
    if (options?.system === 'mainland') {
      product.alertValue = product.mainlandAlertValue ?? product.alertValue;
      product.status = product.mainlandStatus ?? product.status;
    } else if (options?.system === 'overseas') {
      product.alertValue = product.overseasAlertValue ?? product.alertValue;
      product.status = product.overseasStatus ?? product.status;
    }
    return product;
  });
}

export function findLatest(options?: { category?: string; system?: SubSystem }): Product[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  // Only return latest versions (products that are not a parent of another product)
  conditions.push(`id NOT IN (SELECT parentId FROM products WHERE parentId IS NOT NULL)`);

  if (options?.category) {
    conditions.push(`category = ?`);
    params.push(options.category);
  }
  if (options?.system === 'mainland') {
    conditions.push(`syncMainland = 1`);
  } else if (options?.system === 'overseas') {
    conditions.push(`syncOverseas = 1`);
  }

  let sql = 'SELECT * FROM products';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY createdAt DESC';

  const rows = db.prepare(sql).all(...params);
  return rows.map((row: any) => {
    const product = rowToProduct(row);
    if (options?.system === 'mainland') {
      product.alertValue = product.mainlandAlertValue ?? product.alertValue;
      product.status = product.mainlandStatus ?? product.status;
    } else if (options?.system === 'overseas') {
      product.alertValue = product.overseasAlertValue ?? product.alertValue;
      product.status = product.overseasStatus ?? product.status;
    }
    return product;
  });
}

export function findVersionHistory(productId: string): Product[] {
  const db = getDb();
  // Find all older versions: walk up the parentId chain
  const history: Product[] = [];
  let currentId: string | null = productId;

  while (currentId) {
    const row: any = db.prepare('SELECT * FROM products WHERE id = ?').get(currentId);
    if (!row) break;
    const product = rowToProduct(row);
    if (currentId !== productId) {
      history.push(product);
    }
    currentId = row.parentId || null;
  }

  return history;
}

export function findById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!row) return null;
  return rowToProduct(row);
}

export function create(data: ProductCreateDTO & { parentId?: string }): Product {
  const db = getDb();
  const id = uuid();
  const fields = [
    'id', 'code', 'category', 'status', 'productType', 'productTech', 'species', 'alertValue',
    'version', 'nameEn', 'nameCn', 'projectCode', 'clientUnit', 'clientName',
    'deliveryForm', 'finalReport', 'coverModule', 'dataStandardGb', 'dataLowerLimitGb',
    'actualDataGb', 'segmentCount', 'coreSnpCount', 'mSnpCount', 'indelCount',
    'targetRegionCount', 'segmentInnerType', 'refGenome', 'annotationInfo',
    'refGenomeSpecies', 'refGenomeSizeGb', 'qcParam', 'qcStandard',
    'applicationDirection', 'catalog', 'configDir', 'isLocusSecret', 'reagentQc',
    'transferDate', 'usage', 'recommendCrossCycle', 'traitName',
    'canUpgradeToNewVersion', 'minEffectiveDepth', 'transgenicEvent',
    'transferInfo', 'remark', 'parentId',
  ];

  const values: any[] = fields.map(f => {
    if (f === 'id') return id;
    if (f === 'status') return 'Pending';
    // Boolean fields → 0/1
    if (f === 'finalReport' || f === 'isLocusSecret' || f === 'canUpgradeToNewVersion') {
      return (data as any)[f] ? 1 : 0;
    }
    const val = (data as any)[f];
    return val ?? null;
  });

  const cols = fields.join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  db.prepare(`INSERT INTO products (${cols}) VALUES (${placeholders})`).run(...values);
  return findById(id)!;
}

export function update(id: string, data: ProductUpdateDTO): Product | null {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existing) return null;

  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
  if (entries.length === 0) return findById(id);

  const setClauses: string[] = [];
  const params: any[] = [];

  for (const [key, value] of entries) {
    setClauses.push(`${key} = ?`);
    // Convert booleans to 0/1
    if (key === 'finalReport' || key === 'isLocusSecret' || key === 'canUpgradeToNewVersion') {
      params.push(value ? 1 : 0);
    } else {
      params.push(value);
    }
  }
  setClauses.push(`updatedAt = datetime('now')`);
  params.push(id);

  db.prepare(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  return findById(id);
}

export function updateStatus(id: string, status: ProductStatus, extraFields?: Record<string, any>): Product | null {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existing) return null;

  const setClauses: string[] = ['status = ?'];
  const params: any[] = [status];

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }
  }
  setClauses.push(`updatedAt = datetime('now')`);
  params.push(id);

  db.prepare(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  return findById(id);
}

export function updateSyncFields(id: string, fields: {
  syncMainland?: boolean; syncOverseas?: boolean;
  mainlandAlertValue?: number; overseasAlertValue?: number;
  mainlandStatus?: string; overseasStatus?: string;
}): Product | null {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existing) return null;

  const setClauses: string[] = [];
  const params: any[] = [];

  const fieldMap: Record<string, any> = {
    syncMainland: fields.syncMainland !== undefined ? (fields.syncMainland ? 1 : 0) : undefined,
    syncOverseas: fields.syncOverseas !== undefined ? (fields.syncOverseas ? 1 : 0) : undefined,
    mainlandAlertValue: fields.mainlandAlertValue,
    overseasAlertValue: fields.overseasAlertValue,
    mainlandStatus: fields.mainlandStatus,
    overseasStatus: fields.overseasStatus,
  };

  for (const [key, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updatedAt = datetime('now')`);
  params.push(id);

  db.prepare(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  return findById(id);
}

export function remove(id: string): boolean {
  const db = getDb();
  db.prepare(`DELETE FROM reagent_sync_configs WHERE reagentId IN (SELECT id FROM reagents WHERE productId = ?)`).run(id);
  db.prepare(`DELETE FROM reagent_warehouses WHERE reagentId IN (SELECT id FROM reagents WHERE productId = ?)`).run(id);
  db.prepare(`DELETE FROM reagents WHERE productId = ?`).run(id);
  const result = db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
  return result.changes > 0;
}
