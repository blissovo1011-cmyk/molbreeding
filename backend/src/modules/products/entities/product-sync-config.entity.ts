import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum SyncType {
  MAINLAND = 'mainland',
  OVERSEAS = 'overseas',
}

export enum SyncStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('product_sync_configs')
export class ProductSyncConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.syncConfig, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'enum',
    enum: SyncType,
  })
  syncType: SyncType;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: 100 })
  alertValue: number;

  @Column({ length: 20, nullable: true })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  syncedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  syncResult: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
