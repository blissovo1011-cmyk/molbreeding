import { query, queryOne, execute } from '../db.js';
import { v4 as uuid } from 'uuid';
import type { Product, ProductCreateDTO, ProductUpdateDTO, ProductStatus, SubSystem } from '../types.js';

function rowToProduct(row: any): Product {
  const p = { ...row };
  // Build mainlandConfig and overseasConfig
  p.mainlandConfig = p.syncMainland
    ? { alertValue: p.mainlandAlertValue, status: p.mainlandStatus }
    : undefined;
  p.overseasConfig = p.syncOverseas
    ? { alertValue: p.overseasAlertValue, status: p.overseasStatus }
    : undefined;
  return p as Product;
}

export async function findAll(options?: { category?: string; system?: SubSystem }): Promise<Product[]> {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (options?.category) {
    conditions.push(`category = $${idx++}`);
    params.push(options.category);
  }
  if (options?.system === 'mainland') {
    conditions.push(`"syncMainland" = true`);
  } else if (options?.system === 'overseas') {
    conditions.push(`"syncOverseas" = true`);
  }

  let sql = 'SELECT * FROM products';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY "createdAt" DESC';

  const rows = await query(sql, params);
  return rows.map((row) => {
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

export async function findById(id: string): Promise<Product | null> {
  const row = await queryOne('SELECT * FROM products WHERE id = $1', [id]);
  if (!row) return null;
  return rowToProduct(row);
}

export async function create(data: ProductCreateDTO): Promise<Product> {
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
    'transferInfo', 'remark',
  ];

  const values: any[] = fields.map(f => {
    if (f === 'id') return id;
    if (f === 'status') return 'Pending';
    // Boolean fields default to false
    if (f === 'finalReport' || f === 'isLocusSecret' || f === 'canUpgradeToNewVersion') {
      return (data as any)[f] ?? false;
    }
    const val = (data as any)[f];
    return val ?? null;
  });

  const cols = fields.map(f => `"${f}"`).join(', ');
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  await execute(`INSERT INTO products (${cols}) VALUES (${placeholders})`, values);
  return (await findById(id))!;
}

export async function update(id: string, data: ProductUpdateDTO): Promise<Product | null> {
  const existing = await queryOne('SELECT id FROM products WHERE id = $1', [id]);
  if (!existing) return null;

  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
  if (entries.length === 0) return findById(id);

  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  for (const [key, value] of entries) {
    setClauses.push(`"${key}" = $${idx++}`);
    params.push(value);
  }
  setClauses.push(`"updatedAt" = NOW()`);
  params.push(id);

  await execute(`UPDATE products SET ${setClauses.join(', ')} WHERE id = $${idx}`, params);
  return findById(id);
}

export async function updateStatus(id: string, status: ProductStatus, extraFields?: Record<string, any>): Promise<Product | null> {
  const existing = await queryOne('SELECT id FROM products WHERE id = $1', [id]);
  if (!existing) return null;

  const setClauses: string[] = [`status = $1`];
  const params: any[] = [status];
  let idx = 2;

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      if (value !== undefined) {
        setClauses.push(`"${key}" = $${idx++}`);
        params.push(value);
      }
    }
  }
  setClauses.push(`"updatedAt" = NOW()`);
  params.push(id);

  await execute(`UPDATE products SET ${setClauses.join(', ')} WHERE id = $${idx}`, params);
  return findById(id);
}

export async function updateSyncFields(id: string, fields: {
  syncMainland?: boolean; syncOverseas?: boolean;
  mainlandAlertValue?: number; overseasAlertValue?: number;
  mainlandStatus?: string; overseasStatus?: string;
}): Promise<Product | null> {
  const existing = await queryOne('SELECT id FROM products WHERE id = $1', [id]);
  if (!existing) return null;

  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  const fieldMap: Record<string, any> = {
    syncMainland: fields.syncMainland,
    syncOverseas: fields.syncOverseas,
    mainlandAlertValue: fields.mainlandAlertValue,
    overseasAlertValue: fields.overseasAlertValue,
    mainlandStatus: fields.mainlandStatus,
    overseasStatus: fields.overseasStatus,
  };

  for (const [key, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      setClauses.push(`"${key}" = $${idx++}`);
      params.push(value);
    }
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`"updatedAt" = NOW()`);
  params.push(id);

  await execute(`UPDATE products SET ${setClauses.join(', ')} WHERE id = $${idx}`, params);
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  await execute(`DELETE FROM reagent_sync_configs WHERE "reagentId" IN (SELECT id FROM reagents WHERE "productId" = $1)`, [id]);
  await execute(`DELETE FROM reagent_warehouses WHERE "reagentId" IN (SELECT id FROM reagents WHERE "productId" = $1)`, [id]);
  await execute(`DELETE FROM reagents WHERE "productId" = $1`, [id]);
  const count = await execute(`DELETE FROM products WHERE id = $1`, [id]);
  return count > 0;
}
