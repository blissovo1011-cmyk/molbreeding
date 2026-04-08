import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReagentsController } from './reagents.controller';
import { ReagentsService } from './reagents.service';
import { Reagent } from './entities/reagent.entity';
import { ReagentWarehouseConfig } from './entities/reagent-warehouse-config.entity';
import { ReagentSyncConfig } from './entities/reagent-sync-config.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reagent,
      ReagentWarehouseConfig,
      ReagentSyncConfig,
      InventoryBatch,
    ]),
  ],
  controllers: [ReagentsController],
  providers: [ReagentsService],
  exports: [ReagentsService],
})
export class ReagentsModule {}
