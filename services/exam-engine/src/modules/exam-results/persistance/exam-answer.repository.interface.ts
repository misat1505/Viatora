import { ExamAnswerEntity } from './entities/exam-answer.entity';

export interface IExamAnswerRepository {
  create(data: Partial<ExamAnswerEntity>): ExamAnswerEntity;
  saveMany(answers: ExamAnswerEntity[]): Promise<ExamAnswerEntity[]>;
  findBySession(sessionId: string): Promise<ExamAnswerEntity[]>;
}
