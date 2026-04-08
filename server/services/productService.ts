import { getDb } from '../db';
import { NotFoundError, ValidationError, ConflictError } from '../errors';
import * as productRepo from '../repositories/productRepo';
import type { Product, ProductCreateDTO, ProductUpdateDTO, PublishDTO, OfflineDTO, SubSystem } from '../types';

const REQUIRED_FIELDS = ['code', 'category', 'productType', 'productTech', 'species', 'alertValue'] as const;
const VALID_CATEGORIES = ['自主研发', '定制开发'];
const VALID_PRODUCT_TECHS = ['GenoBaits®', 'GenoPlexs®'];

export function listProducts(options?: { category?: string; system?: SubSystem }): Product[] {
  return productRepo.findAll(options);
}

export function getProduct(id: string): Product {
  const product = productRepo.findById(id);
  if (!product) {
    throw new NotFoundError('Product');
  }
  return product;
}

export function createProduct(data: ProductCreateDTO): Product {
  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  // Validate enums
  if (!VALID_CATEGORIES.includes(data.category)) {
    throw new ValidationError(`Invalid category: ${data.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!VALID_PRODUCT_TECHS.includes(data.productTech)) {
    throw new ValidationError(`Invalid productTech: ${data.productTech}. Must be one of: ${VALID_PRODUCT_TECHS.join(', ')}`);
  }

  // Validate alertValue is a positive integer
  if (!Number.isInteger(data.alertValue) || data.alertValue <= 0) {
    throw new ValidationError('alertValue must be a positive integer');
  }

  // Check code uniqueness
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE code = ?').get(data.code);
  if (existing) {
    throw new ConflictError('产品编号已存在');
  }

  return productRepo.create(data);
}

export function updateProduct(id: string, data: ProductUpdateDTO): Product {
  const product = productRepo.update(id, data);
  if (!product) {
    throw new NotFoundError('Product');
  }
  return product;
}

export function publishProduct(id: string, data: PublishDTO): Product {
  const product = productRepo.findById(id);
  if (!product) {
    throw new NotFoundError('Product');
  }
  if (product.status === 'Effective') {
    throw new ValidationError('已在售的产品无需重复上架');
  }

  // Update status to Effective with optional transferInfo and remark
  const extraFields: Record<string, any> = {};
  if (data.transferInfo !== undefined) extraFields.transferInfo = data.transferInfo;
  if (data.remark !== undefined) extraFields.remark = data.remark;

  productRepo.updateStatus(id, 'Effective', extraFields);

  // Update sync fields if provided
  const syncFields: Record<string, any> = {};
  if (data.syncMainland !== undefined) {
    syncFields.syncMainland = data.syncMainland;
    if (data.syncMainland) {
      syncFields.mainlandStatus = 'Effective';
    }
  }
  if (data.syncOverseas !== undefined) {
    syncFields.syncOverseas = data.syncOverseas;
    if (data.syncOverseas) {
      syncFields.overseasStatus = 'Effective';
    }
  }
  if (data.mainlandAlertValue !== undefined) syncFields.mainlandAlertValue = data.mainlandAlertValue;
  if (data.overseasAlertValue !== undefined) syncFields.overseasAlertValue = data.overseasAlertValue;

  if (Object.keys(syncFields).length > 0) {
    productRepo.updateSyncFields(id, syncFields);
  }

  return productRepo.findById(id)!;
}

export function offlineProduct(id: string, data: OfflineDTO): Product {
  const product = productRepo.findById(id);
  if (!product) {
    throw new NotFoundError('Product');
  }
  if (product.status !== 'Effective') {
    throw new ValidationError('只有在售状态的产品可以下架');
  }

  // Update status to Obsolete with optional offlineReason and remark
  const extraFields: Record<string, any> = {};
  if (data.offlineReason !== undefined) extraFields.offlineReason = data.offlineReason;
  if (data.remark !== undefined) extraFields.remark = data.remark;

  // Cascade: set subsystem statuses to Obsolete
  extraFields.mainlandStatus = 'Obsolete';
  extraFields.overseasStatus = 'Obsolete';

  productRepo.updateStatus(id, 'Obsolete', extraFields);

  return productRepo.findById(id)!;
}
