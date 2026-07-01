import { Inject, Injectable } from '@nestjs/common';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import { type IExamRepository } from './persistance/exam.repository.interface';

@Injectable()
export class ExamService {
  constructor(
    @Inject(EXAM_REPOSITORY_TOKEN)
    private readonly examRepository: IExamRepository,
  ) {}

  async startExamSession(category: string) {
    const questions = await this.examRepository.getQuestionsByCategory({
      category,
      questionType: 'basic',
      count: 5,
    });
    return questions;
  }
}
