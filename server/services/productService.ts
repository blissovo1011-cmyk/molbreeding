import { getDb } from '../db.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors.js';
import * as productRepo from '../repositories/productRepo.js';
import type { Product, ProductCreateDTO, ProductUpdateDTO, PublishDTO, OfflineDTO, SubSystem } from '../types.js';

const REQUIRED_FIELDS = ['code', 'category', 'productType', 'productTech', 'species', 'alertValue'] as const;
const VALID_CATEGORIES = ['自主研发', '定制开发'];
const VALID_PRODUCT_TECHS = ['GenoBaits®', 'GenoPlexs®'];

export function listProducts(options?: { category?: string; system?: SubSystem }): Product[] {
  return productRepo.findLatest(options);
}

export function listAllProducts(options?: { category?: string; system?: SubSystem }): Product[] {
  return productRepo.findAll(options);
}

export function getProduct(id: string): Product {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  return product;
}

export function createProduct(data: ProductCreateDTO): Product {
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

  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE code = ? AND id NOT IN (SELECT parentId FROM products WHERE parentId IS NOT NULL)').all(data.code);
  if (existing.length > 0) throw new ConflictError('产品编号已存在');

  return productRepo.create(data);
}

export function updateProduct(id: string, data: ProductUpdateDTO): Product {
  const product = productRepo.update(id, data);
  if (!product) throw new NotFoundError('Product');
  return product;
}

export function publishProduct(id: string, data: PublishDTO): Product {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (product.status === 'Effective') throw new ValidationError('已在售的产品无需重复上架');

  const extraFields: Record<string, any> = {};
  if (data.transferInfo !== undefined) extraFields.transferInfo = data.transferInfo;
  if (data.remark !== undefined) extraFields.remark = data.remark;
  productRepo.updateStatus(id, 'Effective', extraFields);

  const syncFields: Record<string, any> = {};
  if (data.syncMainland !== undefined) { syncFields.syncMainland = data.syncMainland; if (data.syncMainland) syncFields.mainlandStatus = 'Effective'; }
  if (data.syncOverseas !== undefined) { syncFields.syncOverseas = data.syncOverseas; if (data.syncOverseas) syncFields.overseasStatus = 'Effective'; }
  if (data.mainlandAlertValue !== undefined) syncFields.mainlandAlertValue = data.mainlandAlertValue;
  if (data.overseasAlertValue !== undefined) syncFields.overseasAlertValue = data.overseasAlertValue;
  if (Object.keys(syncFields).length > 0) productRepo.updateSyncFields(id, syncFields);

  return productRepo.findById(id)!;
}

export function offlineProduct(id: string, data: OfflineDTO): Product {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  if (product.status !== 'Effective') throw new ValidationError('只有在售状态的产品可以下架');

  const extraFields: Record<string, any> = {};
  if (data.offlineReason !== undefined) extraFields.offlineReason = data.offlineReason;
  if (data.remark !== undefined) extraFields.remark = data.remark;
  extraFields.mainlandStatus = 'Obsolete';
  extraFields.overseasStatus = 'Obsolete';
  productRepo.updateStatus(id, 'Obsolete', extraFields);

  return productRepo.findById(id)!;
}

export function deleteProduct(id: string): void {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  productRepo.remove(id);
}

export function upgradeProduct(id: string, data: ProductCreateDTO): Product {
  const oldProduct = productRepo.findById(id);
  if (!oldProduct) throw new NotFoundError('Product');
  if (oldProduct.status !== 'Effective') throw new ValidationError('只有在售状态的产品可以升级');

  // Offline old version
  productRepo.updateStatus(id, 'Obsolete', { mainlandStatus: 'Obsolete', overseasStatus: 'Obsolete' });

  // Create new version with parentId pointing to old version, inheriting sync config
  const newData = { ...data, parentId: id };
  const newProduct = productRepo.create(newData);

  // Inherit sync settings from old product
  const syncFields: Record<string, any> = {};
  if (oldProduct.syncMainland) {
    syncFields.syncMainland = true;
    syncFields.mainlandAlertValue = oldProduct.mainlandAlertValue;
    syncFields.mainlandStatus = 'Effective';
  }
  if (oldProduct.syncOverseas) {
    syncFields.syncOverseas = true;
    syncFields.overseasAlertValue = oldProduct.overseasAlertValue;
    syncFields.overseasStatus = 'Effective';
  }
  if (Object.keys(syncFields).length > 0) {
    productRepo.updateSyncFields(newProduct.id, syncFields);
  }

  // Also set new product status to Effective (upgrade means it's immediately live)
  productRepo.updateStatus(newProduct.id, 'Effective', {});

  return productRepo.findById(newProduct.id)!;
}

export function getVersionHistory(id: string): Product[] {
  const product = productRepo.findById(id);
  if (!product) throw new NotFoundError('Product');
  return productRepo.findVersionHistory(id);
}
