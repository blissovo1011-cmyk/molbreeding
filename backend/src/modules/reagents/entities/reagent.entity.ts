import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ReagentWarehouseConfig } from './reagent-warehouse-config.entity';
import { ReagentSyncConfig } from './reagent-sync-config.entity';
import { InventoryBatch } from './inventory-batch.entity';

export enum ReagentStatus {
  PENDING = 'pending',
  EFFECTIVE = 'effective',
  OBSOLETE = 'obsolete',
}

@Entity('reagents')
export class Reagent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  category: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, (product) => product.reagents, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 100, nullable: true })
  spec: string;

  @Column({
    type: 'enum',
    enum: ReagentStatus,
    default: ReagentStatus.PENDING,
  })
  status: ReagentStatus;

  @Column({ length: 50, nullable: true })
  batchNo: string;

  @Column({ nullable: true })
  stock: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;

  @OneToMany(() => ReagentWarehouseConfig, (config) => config.reagent)
  warehouseConfigs: ReagentWarehouseConfig[];

  @OneToMany(() => ReagentSyncConfig, (config) => config.reagent)
  syncConfigs: ReagentSyncConfig[];

  @OneToMany(() => InventoryBatch, (batch) => batch.reagent)
  inventoryBatches: InventoryBatch[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
