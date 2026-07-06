import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAnswerEntity } from './entities/exam-answer.entity';
import { IExamAnswerRepository } from './exam-answer.repository.interface';

export const EXAM_ANSWER_REPOSITORY_TOKEN = Symbol(
  'EXAM_ANSWER_REPOSITORY_TOKEN',
);

@Injectable()
export class ExamAnswerRepository implements IExamAnswerRepository {
  constructor(
    @InjectRepository(ExamAnswerEntity)
    private readonly repo: Repository<ExamAnswerEntity>,
  ) {}

  create(data: Partial<ExamAnswerEntity>) {
    return this.repo.create(data);
  }

  async saveMany(answers: ExamAnswerEntity[]) {
    return this.repo.save(answers);
  }

  async findBySession(sessionId: string) {
    return this.repo.find({ where: { session_id: sessionId } });
  }
}
