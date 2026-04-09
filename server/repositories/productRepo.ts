import { getDb } from '../db';
import { v4 as uuid } from 'uuid';
import type { Product, ProductCreateDTO, ProductUpdateDTO, ProductStatus, SubSystem } from '../types';

// Boolean fields stored as INTEGER 0/1 in SQLite
const BOOLEAN_FIELDS = ['finalReport', 'isLocusSecret', 'canUpgradeToNewVersion', 'syncMainland', 'syncOverseas'] as const;

/** Convert a raw SQLite row to a Product entity with proper JS booleans */
function rowToProduct(row: any): Product {
  const product = { ...row };
  for (const field of BOOLEAN_FIELDS) {
    if (field in product) {
      product[field] = !!product[field];
    }
  }
  return product as Product;
}

export function findAll(options?: { category?: string; system?: SubSystem }): Product[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }

  if (options?.system === 'mainland') {
    conditions.push('syncMainland = 1');
  } else if (options?.system === 'overseas') {
    conditions.push('syncOverseas = 1');
  }

  let sql = 'SELECT * FROM products';
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY createdAt DESC';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((row) => {
    const product = rowToProduct(row);

    // Build mainlandConfig and overseasConfig objects (same as findById)
    (product as any).mainlandConfig = product.syncMainland
      ? { alertValue: product.mainlandAlertValue, status: product.mainlandStatus }
      : undefined;

    (product as any).overseasConfig = product.syncOverseas
      ? { alertValue: product.overseasAlertValue, status: product.overseasStatus }
      : undefined;

    // When system is specified, map the subsystem alertValue/status onto the response
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

export function findById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
  if (!row) return null;

  const product = rowToProduct(row);

  // Include mainlandConfig and overseasConfig objects for detail view
  (product as any).mainlandConfig = product.syncMainland
    ? { alertValue: product.mainlandAlertValue, status: product.mainlandStatus }
    : undefined;

  (product as any).overseasConfig = product.syncOverseas
    ? { alertValue: product.overseasAlertValue, status: product.overseasStatus }
    : undefined;

  return product;
}

export function create(data: ProductCreateDTO): Product {
  const db = getDb();
  const id = uuid();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

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
    'transferInfo', 'remark', 'syncMainland', 'syncOverseas', 'createdAt', 'updatedAt',
  ];

  const values: any[] = [];
  for (const field of fields) {
    if (field === 'id') { values.push(id); continue; }
    if (field === 'status') { values.push('Pending'); continue; }
    if (field === 'syncMainland') { values.push(0); continue; }
    if (field === 'syncOverseas') { values.push(0); continue; }
    if (field === 'createdAt' || field === 'updatedAt') { values.push(now); continue; }

    const val = (data as any)[field];
    // Convert boolean fields to 0/1 for SQLite
    if (field === 'finalReport' || field === 'isLocusSecret' || field === 'canUpgradeToNewVersion') {
      values.push(val ? 1 : 0);
    } else {
      values.push(val ?? null);
    }
  }

  const placeholders = fields.map(() => '?').join(', ');
  const sql = `INSERT INTO products (${fields.join(', ')}) VALUES (${placeholders})`;
  db.prepare(sql).run(...values);

  return findById(id)!;
}

export function update(id: string, data: ProductUpdateDTO): Product | null {
  const db = getDb();

  // Check existence first
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existing) return null;

  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
  if (entries.length === 0) {
    return findById(id);
  }

  const setClauses: string[] = [];
  const params: any[] = [];

  for (const [key, value] of entries) {
    setClauses.push(`${key} = ?`);
    // Convert boolean fields to 0/1
    if (key === 'finalReport' || key === 'isLocusSecret' || key === 'canUpgradeToNewVersion') {
      params.push(value ? 1 : 0);
    } else {
      params.push(value);
    }
  }

  // Always update updatedAt
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  setClauses.push('updatedAt = ?');
  params.push(now);

  params.push(id);
  const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...params);

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

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  setClauses.push('updatedAt = ?');
  params.push(now);

  params.push(id);
  const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...params);

  return findById(id);
}

export function updateSyncFields(id: string, fields: {
  syncMainland?: boolean;
  syncOverseas?: boolean;
  mainlandAlertValue?: number;
  overseasAlertValue?: number;
  mainlandStatus?: string;
  overseasStatus?: string;
}): Product | null {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existing) return null;

  const setClauses: string[] = [];
  const params: any[] = [];

  if (fields.syncMainland !== undefined) {
    setClauses.push('syncMainland = ?');
    params.push(fields.syncMainland ? 1 : 0);
  }
  if (fields.syncOverseas !== undefined) {
    setClauses.push('syncOverseas = ?');
    params.push(fields.syncOverseas ? 1 : 0);
  }
  if (fields.mainlandAlertValue !== undefined) {
    setClauses.push('mainlandAlertValue = ?');
    params.push(fields.mainlandAlertValue);
  }
  if (fields.overseasAlertValue !== undefined) {
    setClauses.push('overseasAlertValue = ?');
    params.push(fields.overseasAlertValue);
  }
  if (fields.mainlandStatus !== undefined) {
    setClauses.push('mainlandStatus = ?');
    params.push(fields.mainlandStatus);
  }
  if (fields.overseasStatus !== undefined) {
    setClauses.push('overseasStatus = ?');
    params.push(fields.overseasStatus);
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  setClauses.push('updatedAt = ?');
  params.push(now);

  params.push(id);
  const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...params);

  return findById(id);
}
