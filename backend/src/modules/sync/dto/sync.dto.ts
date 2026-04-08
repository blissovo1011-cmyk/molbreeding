import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum SyncEntityType {
  PRODUCT = 'product',
  REAGENT = 'reagent',
}

export enum SyncTarget {
  MAINLAND = 'mainland',
  OVERSEAS = 'overseas',
}

export class SyncRequestDto {
  @ApiProperty({ description: '同步实体类型', enum: SyncEntityType })
  @IsEnum(SyncEntityType)
  entityType: SyncEntityType;

  @ApiProperty({ description: '实体ID' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: '同步目标', enum: SyncTarget })
  @IsEnum(SyncTarget)
  target: SyncTarget;
}

export class SyncBatchRequestDto {
  @ApiProperty({ description: '同步实体类型', enum: SyncEntityType })
  @IsEnum(SyncEntityType)
  entityType: SyncEntityType;

  @ApiProperty({ description: '实体ID列表' })
  @IsString({ each: true })
  entityIds: string[];

  @ApiProperty({ description: '同步目标', enum: SyncTarget })
  @IsEnum(SyncTarget)
  target: SyncTarget;
}

export class SyncLogQueryDto {
  @ApiPropertyOptional({ description: '同步实体类型', enum: SyncEntityType })
  @IsOptional()
  @IsEnum(SyncEntityType)
  entityType?: SyncEntityType;

  @ApiPropertyOptional({ description: '同步状态', enum: ['pending', 'success', 'failed'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  limit?: number = 20;
}
