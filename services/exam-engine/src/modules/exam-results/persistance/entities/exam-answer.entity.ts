import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { ExamResultEntity } from './exam-result.entity';

@Entity('exam_answers')
export class ExamAnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  session_id!: string;

  @ManyToOne(() => ExamResultEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: ExamResultEntity;

  @Column({ type: 'uuid' })
  question_id!: string;

  @Column({ type: 'smallint' })
  question_points!: number;

  @Column({ type: 'char', length: 1 })
  selected_option!: string;

  @Column({ type: 'char', length: 1 })
  correct_option!: string;

  @Column({ type: 'boolean' })
  is_correct!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  answered_at!: Date;
}
