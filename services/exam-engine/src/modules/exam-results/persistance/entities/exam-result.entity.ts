import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { ExamStatus } from './exam-status';

@Entity('exam_sessions')
export class ExamResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({
    type: 'enum',
    enum: ExamStatus,
  })
  status!: ExamStatus;

  @Column({ type: 'varchar', length: 8 })
  category!: string;

  @Column({ type: 'smallint' })
  total_questions!: number;

  @Column({ type: 'smallint', nullable: true })
  correct_answers!: number;

  @Column({ type: 'smallint', nullable: true })
  earned_points!: number;

  @Column({ type: 'smallint' })
  max_points!: number;

  @Column({ type: 'boolean', nullable: true })
  passed!: boolean;

  @Column({ type: 'int' })
  time_limit_seconds!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  started_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at!: Date;
}
