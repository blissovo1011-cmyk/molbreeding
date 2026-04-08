import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ProductStatus, ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ description: '产品编号' })
  @IsString()
  code: string;

  @ApiProperty({ description: '产品版本' })
  @IsString()
  version: string;

  @ApiProperty({ description: '产品名称(中文)' })
  @IsString()
  nameCn: string;

  @ApiPropertyOptional({ description: '产品名称(英文)' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: '产品类别', enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ description: '产品类型' })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: '产品技术' })
  @IsOptional()
  @IsString()
  productTech?: string;

  @ApiPropertyOptional({ description: '物种' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ description: '客户单位' })
  @IsOptional()
  @IsString()
  clientUnit?: string;

  @ApiPropertyOptional({ description: '客户姓名' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: '项目编号' })
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiPropertyOptional({ description: '试剂预警值' })
  @IsOptional()
  @IsNumber()
  alertValue?: number;

  @ApiPropertyOptional({ description: '结果交付形式' })
  @IsOptional()
  @IsString()
  deliveryForm?: string;

  @ApiPropertyOptional({ description: '配置finalreport' })
  @IsOptional()
  @IsBoolean()
  finalReport?: boolean;

  @ApiPropertyOptional({ description: '产品覆盖模块' })
  @IsOptional()
  @IsString()
  coverModule?: string;

  @ApiPropertyOptional({ description: '数据量标准（Gb）' })
  @IsOptional()
  @IsString()
  dataStandardGb?: string;

  @ApiPropertyOptional({ description: '数据量下限（Gb）' })
  @IsOptional()
  @IsString()
  dataLowerLimitGb?: string;

  @ApiPropertyOptional({ description: '实际上机数据量' })
  @IsOptional()
  @IsString()
  actualDataGb?: string;

  @ApiPropertyOptional({ description: '区段数' })
  @IsOptional()
  @IsString()
  segmentCount?: string;

  @ApiPropertyOptional({ description: '核心SNP位点数' })
  @IsOptional()
  @IsString()
  coreSnpCount?: string;

  @ApiPropertyOptional({ description: 'mSNP位点数' })
  @IsOptional()
  @IsString()
  mSnpCount?: string;

  @ApiPropertyOptional({ description: 'InDel数' })
  @IsOptional()
  @IsString()
  indelCount?: string;

  @ApiPropertyOptional({ description: '目标区域数' })
  @IsOptional()
  @IsString()
  targetRegionCount?: string;

  @ApiPropertyOptional({ description: '区段内位点类型' })
  @IsOptional()
  @IsString()
  segmentInnerType?: string;

  @ApiPropertyOptional({ description: '参考基因组' })
  @IsOptional()
  @IsString()
  refGenome?: string;

  @ApiPropertyOptional({ description: '注释信息' })
  @IsOptional()
  @IsString()
  annotationInfo?: string;

  @ApiPropertyOptional({ description: '参考基因组对应品种' })
  @IsOptional()
  @IsString()
  refGenomeSpecies?: string;

  @ApiPropertyOptional({ description: '参考基因组大小' })
  @IsOptional()
  @IsString()
  refGenomeSizeGb?: string;

  @ApiPropertyOptional({ description: '产品质控参数' })
  @IsOptional()
  @IsString()
  qcParam?: string;

  @ApiPropertyOptional({ description: '产品质控标准' })
  @IsOptional()
  @IsString()
  qcStandard?: string;

  @ApiPropertyOptional({ description: '试剂质控' })
  @IsOptional()
  @IsString()
  reagentQc?: string;

  @ApiPropertyOptional({ description: '应用方向' })
  @IsOptional()
  @IsString()
  applicationDirection?: string;

  @ApiPropertyOptional({ description: 'catalog' })
  @IsOptional()
  @IsString()
  catalog?: string;

  @ApiPropertyOptional({ description: 'config目录' })
  @IsOptional()
  @IsString()
  configDir?: string;

  @ApiPropertyOptional({ description: '位点信息是否保密' })
  @IsOptional()
  @IsBoolean()
  isLocusSecret?: boolean;

  @ApiPropertyOptional({ description: '最低有效测序深度' })
  @IsOptional()
  @IsString()
  minEffectiveDepth?: string;

  @ApiPropertyOptional({ description: '转基因事件' })
  @IsOptional()
  @IsString()
  transgenicEvent?: string;

  @ApiPropertyOptional({ description: '转产日期' })
  @IsOptional()
  @IsDateString()
  transferDate?: string;

  @ApiPropertyOptional({ description: '用法' })
  @IsOptional()
  @IsString()
  usage?: string;

  @ApiPropertyOptional({ description: '推荐杂交循环数' })
  @IsOptional()
  @IsString()
  recommendCrossCycle?: string;

  @ApiPropertyOptional({ description: '性状名称' })
  @IsOptional()
  @IsString()
  traitName?: string;

  @ApiPropertyOptional({ description: '升级后能否再生产为新版本' })
  @IsOptional()
  @IsBoolean()
  canUpgradeToNewVersion?: boolean;

  @ApiPropertyOptional({ description: '转产信息' })
  @IsOptional()
  @IsString()
  transferInfo?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: '产品编号' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '产品名称(中文)' })
  @IsOptional()
  @IsString()
  nameCn?: string;

  @ApiPropertyOptional({ description: '产品状态', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: '产品类别', enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: '物种' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ description: '同步类型', enum: ['mainland', 'overseas'] })
  @IsOptional()
  @IsString()
  syncType?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class ProductStatusChangeDto {
  @ApiProperty({ description: '目标状态', enum: ProductStatus })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiPropertyOptional({ description: '转产日期' })
  @IsOptional()
  @IsDateString()
  transferDate?: string;

  @ApiPropertyOptional({ description: '转产信息' })
  @IsOptional()
  @IsString()
  transferInfo?: string;
}

export class ProductSyncConfigDto {
  @ApiProperty({ description: '同步类型', enum: ['mainland', 'overseas'] })
  @IsString()
  syncType: string;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: '预警值' })
  @IsOptional()
  @IsNumber()
  alertValue?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}
