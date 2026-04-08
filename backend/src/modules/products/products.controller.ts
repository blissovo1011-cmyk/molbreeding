import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductStatusChangeDto,
  ProductSyncConfigDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('产品管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '产品创建成功' })
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编号获取产品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByCode(@Param('code') code: string) {
    return this.productsService.findByCode(code);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新产品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除产品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '变更产品状态' })
  @ApiResponse({ status: 200, description: '状态变更成功' })
  changeStatus(
    @Param('id') id: string,
    @Body() statusChangeDto: ProductStatusChangeDto,
    @Request() req,
  ) {
    return this.productsService.changeStatus(id, statusChangeDto, req.user.id);
  }

  @Get(':id/sync-configs')
  @ApiOperation({ summary: '获取产品同步配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getSyncConfigs(@Param('id') id: string) {
    return this.productsService.getSyncConfigs(id);
  }

  @Put(':id/sync-config')
  @ApiOperation({ summary: '更新产品同步配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateSyncConfig(
    @Param('id') id: string,
    @Body() syncConfigDto: ProductSyncConfigDto,
  ) {
    return this.productsService.updateSyncConfig(id, syncConfigDto);
  }
}
