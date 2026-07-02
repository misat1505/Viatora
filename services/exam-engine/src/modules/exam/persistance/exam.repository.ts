import { ExamSession } from 'src/generated/exam';
import { IExamRepository } from './exam.repository.interface';
import { v4 as uuidv4 } from 'uuid';

export const EXAM_REPOSITORY_TOKEN = Symbol('EXAM_REPOSITORY_TOKEN');

export class ExamRepository implements IExamRepository {
  private prefix = 'exam-engine';

  async createExamSession(
    dto: Omit<ExamSession, 'sessionId'>,
  ): Promise<ExamSession> {
    const exam: ExamSession = { ...dto, sessionId: uuidv4() };

    return exam;
  }
}
