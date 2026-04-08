import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sync_logs')
export class SyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  entityType: string;

  @Column()
  entityId: string;

  @Column({ length: 20 })
  syncType: string;

  @Column({ length: 20 })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  requestData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  responseData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  operatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  @CreateDateColumn()
  createdAt: Date;
}
