import { ExamResultEntity } from './entities/exam-result.entity';

export interface IExamResultRepository {
  findBySessionAndUser(
    sessionId: string,
    userId: string,
  ): Promise<ExamResultEntity | null>;
  create(data: Partial<ExamResultEntity>): ExamResultEntity;
  save(result: ExamResultEntity): Promise<ExamResultEntity>;
}
