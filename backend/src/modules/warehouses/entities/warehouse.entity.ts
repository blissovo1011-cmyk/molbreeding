import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ReagentWarehouseConfig } from '../../reagents/entities/reagent-warehouse-config.entity';

export enum WarehouseType {
  DOMESTIC = 'domestic',
  MAINLAND = 'mainland',
}

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    length: 20,
    default: WarehouseType.DOMESTIC,
  })
  type: WarehouseType;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 100, nullable: true })
  contact: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @OneToMany(() => ReagentWarehouseConfig, (config) => config.warehouse)
  reagentConfigs: ReagentWarehouseConfig[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
