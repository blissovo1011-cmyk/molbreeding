import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReagentStatus } from '../entities/reagent.entity';

class WarehouseConfigDto {
  @ApiProperty({ description: '仓库ID' })
  @IsString()
  warehouseId: string;

  @ApiPropertyOptional({ description: '货号' })
  @IsOptional()
  @IsString()
  itemNo?: string;

  @ApiPropertyOptional({ description: '金蝶物料编码' })
  @IsOptional()
  @IsString()
  kingdeeCode?: string;

  @ApiPropertyOptional({ description: '预警库存' })
  @IsOptional()
  @IsNumber()
  alertStock?: number;
}

export class CreateReagentDto {
  @ApiProperty({ description: '分类' })
  @IsString()
  category: string;

  @ApiProperty({ description: '试剂名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '关联产品ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: '规格' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiPropertyOptional({ description: '批次号' })
  @IsOptional()
  @IsString()
  batchNo?: string;

  @ApiPropertyOptional({ description: '库存' })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ description: '效期' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '仓库配置' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseConfigDto)
  warehouseConfigs?: WarehouseConfigDto[];
}

export class UpdateReagentDto extends PartialType(CreateReagentDto) {}

export class ReagentQueryDto {
  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '试剂名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '关联产品ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: '试剂状态', enum: ReagentStatus })
  @IsOptional()
  @IsEnum(ReagentStatus)
  status?: ReagentStatus;

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

export class ReagentStatusChangeDto {
  @ApiProperty({ description: '目标状态', enum: ReagentStatus })
  @IsEnum(ReagentStatus)
  status: ReagentStatus;
}

export class ReagentSyncConfigDto {
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

  @ApiPropertyOptional({ description: '仓库ID' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '金蝶物料编码' })
  @IsOptional()
  @IsString()
  kingdeeCode?: string;

  @ApiPropertyOptional({ description: '海外本地化名称' })
  @IsOptional()
  @IsString()
  localName?: string;
}

export class InventoryQueryDto {
  @ApiPropertyOptional({ description: '试剂ID' })
  @IsOptional()
  @IsString()
  reagentId?: string;

  @ApiPropertyOptional({ description: '仓库ID' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '是否包含过期', default: true })
  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean = true;
}
