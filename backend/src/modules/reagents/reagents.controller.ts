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
import { ReagentsService } from './reagents.service';
import {
  CreateReagentDto,
  UpdateReagentDto,
  ReagentQueryDto,
  ReagentStatusChangeDto,
  ReagentSyncConfigDto,
  InventoryQueryDto,
} from './dto/reagent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('试剂管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reagents')
export class ReagentsController {
  constructor(private readonly reagentsService: ReagentsService) {}

  @Post()
  @ApiOperation({ summary: '创建试剂' })
  @ApiResponse({ status: 201, description: '试剂创建成功' })
  create(@Body() createReagentDto: CreateReagentDto, @Request() req) {
    return this.reagentsService.create(createReagentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取试剂列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: ReagentQueryDto) {
    return this.reagentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取试剂详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.reagentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新试剂' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id') id: string,
    @Body() updateReagentDto: UpdateReagentDto,
    @Request() req,
  ) {
    return this.reagentsService.update(id, updateReagentDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除试剂' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.reagentsService.remove(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '变更试剂状态' })
  @ApiResponse({ status: 200, description: '状态变更成功' })
  changeStatus(
    @Param('id') id: string,
    @Body() statusChangeDto: ReagentStatusChangeDto,
    @Request() req,
  ) {
    return this.reagentsService.changeStatus(id, statusChangeDto, req.user.id);
  }

  @Get(':id/sync-configs')
  @ApiOperation({ summary: '获取试剂同步配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getSyncConfigs(@Param('id') id: string) {
    return this.reagentsService.getSyncConfigs(id);
  }

  @Put(':id/sync-config')
  @ApiOperation({ summary: '更新试剂同步配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateSyncConfig(
    @Param('id') id: string,
    @Body() syncConfigDto: ReagentSyncConfigDto,
  ) {
    return this.reagentsService.updateSyncConfig(id, syncConfigDto);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: '获取试剂库存信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getInventory(@Param('id') id: string, @Query() query: InventoryQueryDto) {
    return this.reagentsService.getInventory(id, query);
  }

  @Get(':id/inventory/summary')
  @ApiOperation({ summary: '获取试剂库存汇总' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getInventorySummary(@Param('id') id: string) {
    return this.reagentsService.getReagentStockSummary(id);
  }
}
