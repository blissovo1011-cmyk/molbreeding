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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseQueryDto,
} from './dto/warehouse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('仓库管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  @ApiResponse({ status: 201, description: '仓库创建成功' })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: '获取仓库列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: WarehouseQueryDto) {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
