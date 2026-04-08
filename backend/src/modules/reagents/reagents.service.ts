import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Reagent, ReagentStatus } from '../entities/reagent.entity';
import {
  ReagentWarehouseConfig,
} from '../entities/reagent-warehouse-config.entity';
import {
  ReagentSyncConfig,
} from '../entities/reagent-sync-config.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import {
  CreateReagentDto,
  UpdateReagentDto,
  ReagentQueryDto,
  ReagentStatusChangeDto,
  ReagentSyncConfigDto,
  InventoryQueryDto,
} from '../dto/reagent.dto';

@Injectable()
export class ReagentsService {
  constructor(
    @InjectRepository(Reagent)
    private readonly reagentRepository: Repository<Reagent>,
    @InjectRepository(ReagentWarehouseConfig)
    private readonly warehouseConfigRepository: Repository<ReagentWarehouseConfig>,
    @InjectRepository(ReagentSyncConfig)
    private readonly syncConfigRepository: Repository<ReagentSyncConfig>,
    @InjectRepository(InventoryBatch)
    private readonly inventoryBatchRepository: Repository<InventoryBatch>,
  ) {}

  async create(createReagentDto: CreateReagentDto, userId: string): Promise<Reagent> {
    const { warehouseConfigs, ...reagentData } = createReagentDto;

    const reagent = this.reagentRepository.create({
      ...reagentData,
      status: ReagentStatus.PENDING,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedReagent = await this.reagentRepository.save(reagent);

    if (warehouseConfigs && warehouseConfigs.length > 0) {
      const configs = warehouseConfigs.map((config) =>
        this.warehouseConfigRepository.create({
          reagentId: savedReagent.id,
          ...config,
        }),
      );
      await this.warehouseConfigRepository.save(configs);
    }

    return this.findOne(savedReagent.id);
  }

  async findAll(query: ReagentQueryDto): Promise<{ data: Reagent[]; total: number }> {
    const { category, name, productId, status, syncType, page = 1, limit = 20 } = query;

    const queryBuilder = this.reagentRepository
      .createQueryBuilder('reagent')
      .leftJoinAndSelect('reagent.warehouseConfigs', 'warehouseConfigs')
      .leftJoinAndSelect('reagent.syncConfigs', 'syncConfigs')
      .leftJoinAndSelect('reagent.product', 'product');

    if (category) {
      queryBuilder.andWhere('reagent.category LIKE :category', { category: `%${category}%` });
    }
    if (name) {
      queryBuilder.andWhere('reagent.name LIKE :name', { name: `%${name}%` });
    }
    if (productId) {
      queryBuilder.andWhere('reagent.productId = :productId', { productId });
    }
    if (status) {
      queryBuilder.andWhere('reagent.status = :status', { status });
    }
    if (syncType) {
      queryBuilder.andWhere('syncConfigs.syncType = :syncType', { syncType });
      queryBuilder.andWhere('syncConfigs.enabled = :enabled', { enabled: true });
    }

    const [data, total] = await queryBuilder
      .orderBy('reagent.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Reagent> {
    const reagent = await this.reagentRepository.findOne({
      where: { id },
      relations: ['warehouseConfigs', 'warehouseConfigs.warehouse', 'syncConfigs', 'product'],
    });
    if (!reagent) {
      throw new NotFoundException('试剂不存在');
    }
    return reagent;
  }

  async update(id: string, updateReagentDto: UpdateReagentDto, userId: string): Promise<Reagent> {
    const reagent = await this.findOne(id);
    const { warehouseConfigs, ...reagentData } = updateReagentDto;

    Object.assign(reagent, reagentData);
    reagent.updatedBy = userId;
    await this.reagentRepository.save(reagent);

    if (warehouseConfigs && warehouseConfigs.length > 0) {
      await this.warehouseConfigRepository.delete({ reagentId: id });
      const configs = warehouseConfigs.map((config) =>
        this.warehouseConfigRepository.create({
          reagentId: id,
          ...config,
        }),
      );
      await this.warehouseConfigRepository.save(configs);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reagentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('试剂不存在');
    }
  }

  async changeStatus(id: string, statusChangeDto: ReagentStatusChangeDto, userId: string): Promise<Reagent> {
    const reagent = await this.findOne(id);
    reagent.status = statusChangeDto.status;
    reagent.updatedBy = userId;
    return this.reagentRepository.save(reagent);
  }

  async updateSyncConfig(id: string, syncConfigDto: ReagentSyncConfigDto): Promise<ReagentSyncConfig> {
    await this.findOne(id);

    let config = await this.syncConfigRepository.findOne({
      where: { reagentId: id, syncType: syncConfigDto.syncType },
    });

    if (config) {
      Object.assign(config, syncConfigDto);
    } else {
      config = this.syncConfigRepository.create({
        reagentId: id,
        ...syncConfigDto,
      });
    }

    return this.syncConfigRepository.save(config);
  }

  async getSyncConfigs(id: string): Promise<ReagentSyncConfig[]> {
    return this.syncConfigRepository.find({
      where: { reagentId: id },
    });
  }

  async getInventory(id: string, query: InventoryQueryDto): Promise<InventoryBatch[]> {
    const queryBuilder = this.inventoryBatchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.warehouse', 'warehouse')
      .where('batch.reagentId = :id', { id });

    if (query.warehouseId) {
      queryBuilder.andWhere('batch.warehouseId = :warehouseId', {
        warehouseId: query.warehouseId,
      });
    }

    if (!query.includeExpired) {
      queryBuilder.andWhere('batch.expiryDate > :now', { now: new Date() });
    }

    return queryBuilder.orderBy('batch.expiryDate', 'ASC').getMany();
  }

  async getInventoryByReagent(id: string): Promise<any[]> {
    const batches = await this.inventoryBatchRepository.find({
      where: { reagentId: id },
      relations: ['warehouse'],
    });

    return batches.map((batch) => ({
      batchNo: batch.batchNo,
      warehouse: batch.warehouse?.name,
      stock: batch.stock,
      expiryDate: batch.expiryDate,
      qualityStatus: batch.qualityStatus,
    }));
  }

  async getReagentStockSummary(id: string): Promise<{ total: number; alert: boolean }> {
    const reagent = await this.findOne(id);
    const totalStock = await this.inventoryBatchRepository
      .createQueryBuilder('batch')
      .select('SUM(batch.stock)', 'total')
      .where('batch.reagentId = :id', { id })
      .getRawOne();

    const total = parseInt(totalStock?.total || '0', 10);
    const alert = total <= reagent.alertValue;

    return { total, alert };
  }
}
