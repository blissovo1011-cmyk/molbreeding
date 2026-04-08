// --- Enums & Literals ---

export type ProductStatus = 'Pending' | 'Effective' | 'Obsolete';
export type ProductCategory = '自主研发' | '定制开发';
export type ProductTech = 'GenoBaits®' | 'GenoPlexs®';
export type SubSystem = 'mainland' | 'overseas';

// --- API Response ---

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Product DTOs ---

export interface ProductCreateDTO {
  code: string;
  category: ProductCategory;
  productType: string;
  productTech: ProductTech;
  species: string;
  alertValue: number;
  version?: string;
  nameEn?: string;
  nameCn?: string;
  projectCode?: string;
  clientUnit?: string;
  clientName?: string;
  deliveryForm?: string;
  finalReport?: boolean;
  coverModule?: string;
  dataStandardGb?: string;
  dataLowerLimitGb?: string;
  actualDataGb?: string;
  segmentCount?: string;
  coreSnpCount?: string;
  mSnpCount?: string;
  indelCount?: string;
  targetRegionCount?: string;
  segmentInnerType?: string;
  refGenome?: string;
  annotationInfo?: string;
  refGenomeSpecies?: string;
  refGenomeSizeGb?: string;
  qcParam?: string;
  qcStandard?: string;
  applicationDirection?: string;
  catalog?: string;
  configDir?: string;
  isLocusSecret?: boolean;
  reagentQc?: string;
  transferDate?: string;
  usage?: string;
  recommendCrossCycle?: string;
  traitName?: string;
  canUpgradeToNewVersion?: boolean;
  minEffectiveDepth?: string;
  transgenicEvent?: string;
  transferInfo?: string;
  remark?: string;
}

export interface ProductUpdateDTO extends Partial<ProductCreateDTO> {}

export interface PublishDTO {
  transferInfo?: string;
  remark?: string;
  syncMainland?: boolean;
  syncOverseas?: boolean;
  mainlandAlertValue?: number;
  overseasAlertValue?: number;
}

export interface OfflineDTO {
  offlineReason?: string;
  remark?: string;
}

export interface SyncConfigDTO {
  syncMainland: boolean;
  syncOverseas: boolean;
  mainlandAlertValue?: number;
  overseasAlertValue?: number;
}

export interface SubSystemDTO {
  system: SubSystem;
}

// --- Reagent DTOs ---

export interface ReagentWarehouseDTO {
  warehouse: string;
  itemNo: string;
  kingdeeCode: string;
}

export interface ReagentCreateDTO {
  category: string;
  name: string;
  productId: string;
  spec: string;
  warehouses: ReagentWarehouseDTO[];
}

export interface ReagentUpdateDTO {
  category?: string;
  name?: string;
  spec?: string;
  warehouses?: ReagentWarehouseDTO[];
  batchNo?: string;
  stock?: number;
  expiryDate?: string;
}

export interface ReagentSyncDTO {
  syncMainland: boolean;
  syncOverseas: boolean;
  mainlandConfig?: {
    alertValue: number;
    warehouse: string;
    kingdeeCode: string;
  };
  overseasConfig?: {
    alertValue: number;
    warehouse: string;
    kingdeeCode: string;
    localName: string;
  };
}

// --- Entity types (DB row representations) ---

export interface Product {
  id: string;
  code: string;
  category: string;
  status: ProductStatus;
  version: string;
  nameEn: string;
  nameCn: string;
  projectCode?: string;
  productType: string;
  productTech: string;
  species: string;
  clientUnit?: string;
  clientName?: string;
  alertValue: number;
  deliveryForm?: string;
  finalReport: boolean;
  coverModule?: string;
  dataStandardGb?: string;
  dataLowerLimitGb?: string;
  actualDataGb?: string;
  segmentCount?: string;
  coreSnpCount?: string;
  mSnpCount?: string;
  indelCount?: string;
  targetRegionCount?: string;
  segmentInnerType?: string;
  refGenome?: string;
  annotationInfo?: string;
  refGenomeSpecies?: string;
  refGenomeSizeGb?: string;
  qcParam?: string;
  qcStandard?: string;
  applicationDirection?: string;
  catalog?: string;
  configDir?: string;
  isLocusSecret: boolean;
  reagentQc?: string;
  transferDate?: string;
  usage?: string;
  recommendCrossCycle?: string;
  traitName?: string;
  canUpgradeToNewVersion: boolean;
  minEffectiveDepth?: string;
  transgenicEvent?: string;
  transferInfo?: string;
  remark?: string;
  offlineReason?: string;
  syncMainland: boolean;
  syncOverseas: boolean;
  mainlandAlertValue?: number;
  mainlandStatus?: ProductStatus;
  overseasAlertValue?: number;
  overseasStatus?: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReagentWarehouse {
  id: string;
  reagentId: string;
  warehouse: string;
  itemNo: string;
  kingdeeCode: string;
}

export interface ReagentSyncConfig {
  id: string;
  reagentId: string;
  system: SubSystem;
  alertValue?: number;
  warehouse?: string;
  kingdeeCode?: string;
  localName?: string;
  status: ProductStatus;
}

export interface Reagent {
  id: string;
  category: string;
  name: string;
  productId: string;
  spec: string;
  batchNo?: string;
  stock?: number;
  expiryDate?: string;
  status: ProductStatus;
  syncMainland: boolean;
  syncOverseas: boolean;
  warehouses: ReagentWarehouse[];
  mainlandConfig?: { alertValue: number; warehouse: string; kingdeeCode: string };
  overseasConfig?: { alertValue: number; warehouse: string; kingdeeCode: string; localName: string };
  createdAt: string;
  updatedAt: string;
}
