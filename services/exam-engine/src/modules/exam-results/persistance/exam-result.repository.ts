import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResultEntity } from './entities/exam-result.entity';
import { IExamResultRepository } from './exam-result.repository.interface';

export const EXAM_RESULT_REPOSITORY_TOKEN = Symbol(
  'EXAM_RESULT_REPOSITORY_TOKEN',
);

@Injectable()
export class ExamResultRepository implements IExamResultRepository {
  constructor(
    @InjectRepository(ExamResultEntity)
    private readonly repo: Repository<ExamResultEntity>,
  ) {}

  async findBySessionAndUser(sessionId: string, userId: string) {
    return this.repo.findOne({
      where: {
        id: sessionId,
        user_id: userId,
      },
    });
  }

  create(data: Partial<ExamResultEntity>) {
    return this.repo.create(data);
  }

  async save(result: ExamResultEntity) {
    return this.repo.save(result);
  }

  async findByUserId(userId: string) {
    return this.repo.find({
      where: {
        user_id: userId,
      },
      order: {
        completed_at: 'DESC',
      },
    });
  }
}
