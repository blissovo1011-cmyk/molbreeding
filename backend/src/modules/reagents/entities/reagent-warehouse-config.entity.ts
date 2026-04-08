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

@Entity('reagent_warehouse_configs')
export class ReagentWarehouseConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reagentId: string;

  @ManyToOne(() => Reagent, (reagent) => reagent.warehouseConfigs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reagentId' })
  reagent: Reagent;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ length: 50, nullable: true })
  itemNo: string;

  @Column({ length: 100, nullable: true })
  kingdeeCode: string;

  @Column({ default: 0 })
  currentStock: number;

  @Column({ default: 10 })
  alertStock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
