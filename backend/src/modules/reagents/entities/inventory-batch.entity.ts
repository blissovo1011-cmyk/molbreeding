import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reagent } from './reagent.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum QualityStatus {
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
}

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reagentId: string;

  @ManyToOne(() => Reagent, (reagent) => reagent.inventoryBatches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reagentId' })
  reagent: Reagent;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ length: 50 })
  batchNo: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  productionDate: Date;

  @Column({
    length: 20,
    default: QualityStatus.QUALIFIED,
  })
  qualityStatus: QualityStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
