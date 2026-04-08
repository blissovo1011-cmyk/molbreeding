import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductSyncConfig } from '../entities/product-sync-config.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductStatusChangeDto,
  ProductSyncConfigDto,
} from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSyncConfig)
    private readonly syncConfigRepository: Repository<ProductSyncConfig>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { code: createProductDto.code },
    });
    if (existing) {
      throw new ConflictException('产品编号已存在');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      status: ProductStatus.PENDING,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto): Promise<{ data: Product[]; total: number }> {
    const { code, nameCn, status, category, species, syncType, page = 1, limit = 20 } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.syncConfig', 'syncConfig');

    if (code) {
      queryBuilder.andWhere('product.code LIKE :code', { code: `%${code}%` });
    }
    if (nameCn) {
      queryBuilder.andWhere('product.nameCn LIKE :nameCn', { nameCn: `%${nameCn}%` });
    }
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }
    if (species) {
      queryBuilder.andWhere('product.species = :species', { species });
    }
    if (syncType) {
      queryBuilder.andWhere('syncConfig.syncType = :syncType', { syncType });
      queryBuilder.andWhere('syncConfig.enabled = :enabled', { enabled: true });
    }

    const [data, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['syncConfig'],
    });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    return product;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { code },
      relations: ['syncConfig'],
    });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    product.updatedBy = userId;
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('产品不存在');
    }
  }

  async changeStatus(
    id: string,
    statusChangeDto: ProductStatusChangeDto,
    userId: string,
  ): Promise<Product> {
    const product = await this.findOne(id);
    product.status = statusChangeDto.status;
    if (statusChangeDto.transferDate) {
      product.transferDate = new Date(statusChangeDto.transferDate);
    }
    if (statusChangeDto.transferInfo) {
      product.transferInfo = statusChangeDto.transferInfo;
    }
    product.updatedBy = userId;
    return this.productRepository.save(product);
  }

  async updateSyncConfig(
    productId: string,
    syncConfigDto: ProductSyncConfigDto,
  ): Promise<ProductSyncConfig> {
    await this.findOne(productId);

    let config = await this.syncConfigRepository.findOne({
      where: { productId, syncType: syncConfigDto.syncType },
    });

    if (config) {
      Object.assign(config, syncConfigDto);
    } else {
      config = this.syncConfigRepository.create({
        productId,
        ...syncConfigDto,
      });
    }

    return this.syncConfigRepository.save(config);
  }

  async getSyncConfigs(productId: string): Promise<ProductSyncConfig[]> {
    return this.syncConfigRepository.find({
      where: { productId },
    });
  }
}
