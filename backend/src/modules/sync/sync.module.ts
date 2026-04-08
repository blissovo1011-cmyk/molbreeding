import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncLog } from './entities/sync-log.entity';
import { ProductsModule } from '../products/products.module';
import { ReagentsModule } from '../reagents/reagents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncLog]),
    ProductsModule,
    ReagentsModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
