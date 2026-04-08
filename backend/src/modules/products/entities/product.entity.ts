import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductSyncConfig } from './product-sync-config.entity';
import { Reagent } from '../../reagents/entities/reagent.entity';

export enum ProductStatus {
  PENDING = 'pending',
  EFFECTIVE = 'effective',
  OBSOLETE = 'obsolete',
}

export enum ProductCategory {
  SELF_DEVELOPED = '自主研发',
  CUSTOM_DEVELOPED = '定制开发',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 20 })
  version: string;

  @Column({ length: 200 })
  nameCn: string;

  @Column({ length: 200, nullable: true })
  nameEn: string;

  @Column({ length: 50 })
  category: string;

  @Column({ length: 100, nullable: true })
  productType: string;

  @Column({ length: 100, nullable: true })
  productTech: string;

  @Column({ length: 100, nullable: true })
  species: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.PENDING,
  })
  status: ProductStatus;

  @Column({ length: 200, nullable: true })
  clientUnit: string;

  @Column({ length: 100, nullable: true })
  clientName: string;

  @Column({ length: 50, nullable: true })
  projectCode: string;

  @Column({ default: 100 })
  alertValue: number;

  @Column({ length: 100, nullable: true })
  deliveryForm: string;

  @Column({ default: false })
  finalReport: boolean;

  @Column({ length: 200, nullable: true })
  coverModule: string;

  @Column({ length: 50, nullable: true })
  dataStandardGb: string;

  @Column({ length: 50, nullable: true })
  dataLowerLimitGb: string;

  @Column({ length: 50, nullable: true })
  actualDataGb: string;

  @Column({ length: 50, nullable: true })
  segmentCount: string;

  @Column({ length: 50, nullable: true })
  coreSnpCount: string;

  @Column({ length: 50, nullable: true })
  mSnpCount: string;

  @Column({ length: 50, nullable: true })
  indelCount: string;

  @Column({ length: 50, nullable: true })
  targetRegionCount: string;

  @Column({ length: 100, nullable: true })
  segmentInnerType: string;

  @Column({ length: 100, nullable: true })
  refGenome: string;

  @Column({ type: 'text', nullable: true })
  annotationInfo: string;

  @Column({ length: 100, nullable: true })
  refGenomeSpecies: string;

  @Column({ length: 50, nullable: true })
  refGenomeSizeGb: string;

  @Column({ type: 'text', nullable: true })
  qcParam: string;

  @Column({ type: 'text', nullable: true })
  qcStandard: string;

  @Column({ type: 'text', nullable: true })
  reagentQc: string;

  @Column({ length: 200, nullable: true })
  applicationDirection: string;

  @Column({ length: 100, nullable: true })
  catalog: string;

  @Column({ length: 200, nullable: true })
  configDir: string;

  @Column({ default: false })
  isLocusSecret: boolean;

  @Column({ length: 50, nullable: true })
  minEffectiveDepth: string;

  @Column({ length: 100, nullable: true })
  transgenicEvent: string;

  @Column({ type: 'date', nullable: true })
  transferDate: Date;

  @Column({ type: 'text', nullable: true })
  usage: string;

  @Column({ length: 50, nullable: true })
  recommendCrossCycle: string;

  @Column({ length: 100, nullable: true })
  traitName: string;

  @Column({ default: true })
  canUpgradeToNewVersion: boolean;

  @Column({ type: 'text', nullable: true })
  transferInfo: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;

  @OneToOne(() => ProductSyncConfig, (config) => config.product)
  syncConfig: ProductSyncConfig;

  @OneToMany(() => Reagent, (reagent) => reagent.product)
  reagents: Reagent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
