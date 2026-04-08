import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseQueryDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehouseRepository.findOne({
      where: { code: createWarehouseDto.code },
    });
    if (existing) {
      throw new ConflictException('仓库编码已存在');
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(query: WarehouseQueryDto): Promise<Warehouse[]> {
    const { code, name, type, status } = query;

    const queryBuilder = this.warehouseRepository.createQueryBuilder('warehouse');

    if (code) {
      queryBuilder.andWhere('warehouse.code LIKE :code', { code: `%${code}%` });
    }
    if (name) {
      queryBuilder.andWhere('warehouse.name LIKE :name', { name: `%${name}%` });
    }
    if (type) {
      queryBuilder.andWhere('warehouse.type = :type', { type });
    }
    if (status) {
      queryBuilder.andWhere('warehouse.status = :status', { status });
    }

    return queryBuilder.orderBy('warehouse.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['reagentConfigs'],
    });
    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }
    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const result = await this.warehouseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('仓库不存在');
    }
  }
}
