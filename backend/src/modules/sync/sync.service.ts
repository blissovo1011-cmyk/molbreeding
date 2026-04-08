import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SyncLog } from './entities/sync-log.entity';
import { ProductsService } from '../products/products.service';
import { ReagentsService } from '../reagents/reagents.service';
import {
  SyncRequestDto,
  SyncBatchRequestDto,
  SyncLogQueryDto,
  SyncEntityType,
  SyncTarget,
} from './dto/sync.dto';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncLog)
    private readonly syncLogRepository: Repository<SyncLog>,
    private readonly productsService: ProductsService,
    private readonly reagentsService: ReagentsService,
    private readonly configService: ConfigService,
  ) {}

  async syncEntity(syncDto: SyncRequestDto, userId: string): Promise<SyncLog> {
    const { entityType, entityId, target } = syncDto;

    let entity: any;
    if (entityType === SyncEntityType.PRODUCT) {
      entity = await this.productsService.findOne(entityId);
    } else if (entityType === SyncEntityType.REAGENT) {
      entity = await this.reagentsService.findOne(entityId);
    } else {
      throw new BadRequestException('不支持的实体类型');
    }

    const syncLog = this.syncLogRepository.create({
      entityType,
      entityId,
      syncType: target,
      status: 'pending',
      requestData: entity,
      operatorId: userId,
    });
    await this.syncLogRepository.save(syncLog);

    try {
      const result = await this.callMimsApi(entity, target);

      syncLog.status = 'success';
      syncLog.responseData = result;
      syncLog.syncedAt = new Date();
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
    }

    return this.syncLogRepository.save(syncLog);
  }

  async syncBatch(syncDto: SyncBatchRequestDto, userId: string): Promise<SyncLog[]> {
    const results: SyncLog[] = [];
    for (const entityId of syncDto.entityIds) {
      const result = await this.syncEntity(
        {
          entityType: syncDto.entityType,
          entityId,
          target: syncDto.target,
        },
        userId,
      );
      results.push(result);
    }
    return results;
  }

  async getSyncLogs(query: SyncLogQueryDto): Promise<{ data: SyncLog[]; total: number }> {
    const { entityType, status, page = 1, limit = 20 } = query;

    const queryBuilder = this.syncLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.operator', 'operator');

    if (entityType) {
      queryBuilder.andWhere('log.entityType = :entityType', { entityType });
    }
    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async getSyncStatus(entityType: string, entityId: string): Promise<SyncLog[]> {
    return this.syncLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  private async callMimsApi(entity: any, target: SyncTarget): Promise<any> {
    const apiUrl =
      target === SyncTarget.MAINLAND
        ? this.configService.get('MIMS_MAINLAND_API_URL')
        : this.configService.get('MIMS_OVERSEAS_API_URL');

    if (!apiUrl) {
      console.log(`[Mock] 同步到 ${target}:`, entity);
      return { success: true, mock: true, timestamp: new Date().toISOString() };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.configService.get('MIMS_API_KEY', ''),
      },
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      throw new Error(`MIMS API 调用失败: ${response.statusText}`);
    }

    return response.json();
  }
}
