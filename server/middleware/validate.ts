import { ValidationError } from '../errors.js';
import type {
  ProductCreateDTO,
  ReagentCreateDTO,
  SyncConfigDTO,
  ReagentSyncDTO,
} from '../types.js';

const PRODUCT_CATEGORIES = ['自主研发', '定制开发'];
const PRODUCT_TECHS = ['GenoBaits®', 'GenoPlexs®'];
const REAGENT_CATEGORIES = ['Panel类', '建库类', '定量类', '提取类', '单位点检测类', 'SSR检测类', '其它'];
const VALID_STATUSES = ['Pending', 'Effective', 'Obsolete'];

export function validateStatus(value: string): void {
  if (!VALID_STATUSES.includes(value)) {
    throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
}

export function validateProductCreate(body: any): ProductCreateDTO {
  const required = ['code', 'category', 'productType', 'productTech', 'species', 'alertValue'] as const;
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (typeof body.code !== 'string') {
    throw new ValidationError('code must be a string');
  }
  if (!PRODUCT_CATEGORIES.includes(body.category)) {
    throw new ValidationError(`category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`);
  }
  if (typeof body.productType !== 'string') {
    throw new ValidationError('productType must be a string');
  }
  if (!PRODUCT_TECHS.includes(body.productTech)) {
    throw new ValidationError(`productTech must be one of: ${PRODUCT_TECHS.join(', ')}`);
  }
  if (typeof body.species !== 'string') {
    throw new ValidationError('species must be a string');
  }
  if (typeof body.alertValue !== 'number' || !Number.isInteger(body.alertValue) || body.alertValue <= 0) {
    throw new ValidationError('alertValue must be a positive integer');
  }

  return body as ProductCreateDTO;
}

export function validateReagentCreate(body: any): ReagentCreateDTO {
  const required = ['category', 'name', 'productId', 'spec', 'warehouses'] as const;
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (typeof body.category !== 'string') {
    throw new ValidationError('category must be a string');
  }
  if (!REAGENT_CATEGORIES.includes(body.category)) {
    throw new ValidationError(`category must be one of: ${REAGENT_CATEGORIES.join(', ')}`);
  }
  if (typeof body.name !== 'string') {
    throw new ValidationError('name must be a string');
  }
  if (typeof body.productId !== 'string') {
    throw new ValidationError('productId must be a string');
  }
  if (typeof body.spec !== 'string') {
    throw new ValidationError('spec must be a string');
  }
  if (!Array.isArray(body.warehouses) || body.warehouses.length === 0) {
    throw new ValidationError('warehouses must be a non-empty array');
  }

  return body as ReagentCreateDTO;
}

export function validateSyncConfig(body: any): SyncConfigDTO {
  if (body.syncMainland && (body.mainlandAlertValue === undefined || body.mainlandAlertValue === null)) {
    throw new ValidationError('mainlandAlertValue is required when syncMainland is enabled');
  }
  if (body.syncOverseas && (body.overseasAlertValue === undefined || body.overseasAlertValue === null)) {
    throw new ValidationError('overseasAlertValue is required when syncOverseas is enabled');
  }

  return body as SyncConfigDTO;
}

export function validateReagentSync(body: any): ReagentSyncDTO {
  if (body.syncOverseas && body.overseasConfig && !body.overseasConfig.localName) {
    throw new ValidationError('localName is required for overseas sync configuration');
  }

  return body as ReagentSyncDTO;
}
