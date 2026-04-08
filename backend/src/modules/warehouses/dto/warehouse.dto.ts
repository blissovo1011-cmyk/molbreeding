import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { WarehouseType } from '../entities/warehouse.entity';

export class CreateWarehouseDto {
  @ApiProperty({ description: '仓库编码' })
  @IsString()
  code: string;

  @ApiProperty({ description: '仓库名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '仓库类型', enum: WarehouseType })
  @IsEnum(WarehouseType)
  type: WarehouseType;

  @ApiPropertyOptional({ description: '仓库位置' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}

export class WarehouseQueryDto {
  @ApiPropertyOptional({ description: '仓库编码' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '仓库名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '仓库类型', enum: WarehouseType })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}
