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

export enum ReagentSyncType {
  MAINLAND = 'mainland',
  OVERSEAS = 'overseas',
}

@Entity('reagent_sync_configs')
export class ReagentSyncConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reagentId: string;

  @ManyToOne(() => Reagent, (reagent) => reagent.syncConfigs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reagentId' })
  reagent: Reagent;

  @Column({
    type: 'enum',
    enum: ReagentSyncType,
  })
  syncType: ReagentSyncType;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: 100 })
  alertValue: number;

  @Column({ nullable: true })
  warehouseId: string;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ length: 100, nullable: true })
  kingdeeCode: string;

  @Column({ length: 200, nullable: true })
  localName: string;

  @Column({ type: 'timestamp', nullable: true })
  syncedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  syncResult: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
