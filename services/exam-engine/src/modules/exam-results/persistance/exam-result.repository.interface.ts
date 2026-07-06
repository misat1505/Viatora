import { ExamResultEntity } from './entities/exam-result.entity';

export interface IExamResultRepository {
  create(data: Partial<ExamResultEntity>): ExamResultEntity;
  save(result: ExamResultEntity): Promise<ExamResultEntity>;
}
