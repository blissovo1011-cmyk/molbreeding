import { query } from '../db.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors.js';
import * as productRepo from '../repositories/productRepo.js';
import type { Product, ProductCreateDTO, ProductUpdateDTO, PublishDTO, OfflineDTO, SubSystem } from '../types.js';

const REQUIRED_FIELDS = ['code', 'category', 'productType', 'productTech', 'species', 'alertValue'] as const;
const VALID_CATEGORIES = ['自主研发', '定制开发'];
const VALID_PRODUCT_TECHS = ['GenoBaits®', 'GenoPlexs®'];

export async function listProducts(options?: { category?: string; system?: SubSystem }): Promise<Product[]> {
  return productRepo.findAll(options);
}

export async function getProduct(id: string): Promise<Product> {
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function createProduct(data: ProductCreateDTO): Promise<Product> {
  // Coerce alertValue to number
  if (data.alertValue !== undefined) data.alertValue = Number(data.alertValue);
  
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }
  if (!VALID_CATEGORIES.includes(data.category)) throw new ValidationError(`Invalid category`);
  if (!VALID_PRODUCT_TECHS.includes(data.productTech)) throw new ValidationError(`Invalid productTech`);
  if (!Number.isInteger(data.alertValue) || data.alertValue <= 0) throw new ValidationError('alertValue must be a positive integer');

  const existing = await query('SELECT id FROM products WHERE code = $1', [data.code]);
  if (existing.length > 0) throw new ConflictError('产品编号已存在');

  return productRepo.create(data);
}

export async function updateProduct(id: string, data: ProductUpdateDTO): Promise<Product> {
  const product = await productRepo.update(id, data);
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function publishProduct(id: string, data: PublishDTO): Promise<Product> {
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (product.status === 'Effective') throw new ValidationError('已在售的产品无需重复上架');

  const extraFields: Record<string, any> = {};
  if (data.transferInfo !== undefined) extraFields.transferInfo = data.transferInfo;
  if (data.remark !== undefined) extraFields.remark = data.remark;
  await productRepo.updateStatus(id, 'Effective', extraFields);

  const syncFields: Record<string, any> = {};
  if (data.syncMainland !== undefined) { syncFields.syncMainland = data.syncMainland; if (data.syncMainland) syncFields.mainlandStatus = 'Effective'; }
  if (data.syncOverseas !== undefined) { syncFields.syncOverseas = data.syncOverseas; if (data.syncOverseas) syncFields.overseasStatus = 'Effective'; }
  if (data.mainlandAlertValue !== undefined) syncFields.mainlandAlertValue = data.mainlandAlertValue;
  if (data.overseasAlertValue !== undefined) syncFields.overseasAlertValue = data.overseasAlertValue;
  if (Object.keys(syncFields).length > 0) await productRepo.updateSyncFields(id, syncFields);

  return (await productRepo.findById(id))!;
}

export async function offlineProduct(id: string, data: OfflineDTO): Promise<Product> {
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (product.status !== 'Effective') throw new ValidationError('只有在售状态的产品可以下架');

  const extraFields: Record<string, any> = {};
  if (data.offlineReason !== undefined) extraFields.offlineReason = data.offlineReason;
  if (data.remark !== undefined) extraFields.remark = data.remark;
  extraFields.mainlandStatus = 'Obsolete';
  extraFields.overseasStatus = 'Obsolete';
  await productRepo.updateStatus(id, 'Obsolete', extraFields);

  return (await productRepo.findById(id))!;
}
