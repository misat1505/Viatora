import { ExamSession } from 'src/generated/exam';

export interface IExamRepository {
  createExamSession(dto: Omit<ExamSession, 'sessionId'>): Promise<ExamSession>;
  getById(id: string): Promise<ExamSession | null>;
}
