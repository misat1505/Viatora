import { ExamSession } from 'src/generated/exam';
import { IExamRepository } from './exam.repository.interface';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

export const EXAM_REPOSITORY_TOKEN = Symbol('EXAM_REPOSITORY_TOKEN');

export class ExamRepository implements IExamRepository {
  private prefix = 'exam-engine';

  constructor(
    @Inject('REDIS')
    private readonly redis: Redis,
  ) {}

  async createExamSession(
    dto: Omit<ExamSession, 'sessionId'>,
  ): Promise<ExamSession> {
    const exam: ExamSession = { ...dto, sessionId: uuidv4() };
    const key = `${this.prefix}:exams:${exam.sessionId}`;

    await this.redis.set(key, JSON.stringify(exam));

    return exam;
  }

  async getById(id: string): Promise<ExamSession | null> {
    const key = `${this.prefix}:exams:${id}`;
    const data = await this.redis.get(key);
    if (!data) return null;

    // TODO: proper validation
    return JSON.parse(data) as ExamSession;
  }
}
