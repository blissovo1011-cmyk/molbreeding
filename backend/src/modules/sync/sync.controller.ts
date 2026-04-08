import {
  Controller,
  Post,
  Get,
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
import { SyncService } from './sync.service';
import {
  SyncRequestDto,
  SyncBatchRequestDto,
  SyncLogQueryDto,
  SyncEntityType,
} from './dto/sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('MIMS同步')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('single')
  @ApiOperation({ summary: '同步单个实体到MIMS' })
  @ApiResponse({ status: 200, description: '同步成功' })
  syncSingle(@Body() syncDto: SyncRequestDto, @Request() req) {
    return this.syncService.syncEntity(syncDto, req.user.id);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量同步到MIMS' })
  @ApiResponse({ status: 200, description: '同步成功' })
  syncBatch(@Body() syncDto: SyncBatchRequestDto, @Request() req) {
    return this.syncService.syncBatch(syncDto, req.user.id);
  }

  @Get('logs')
  @ApiOperation({ summary: '获取同步日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getSyncLogs(@Query() query: SyncLogQueryDto) {
    return this.syncService.getSyncLogs(query);
  }

  @Get('status/:entityType/:entityId')
  @ApiOperation({ summary: '获取实体同步状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getSyncStatus(@Param('entityType') entityType: SyncEntityType, @Param('entityId') entityId: string) {
    return this.syncService.getSyncStatus(entityType, entityId);
  }
}
