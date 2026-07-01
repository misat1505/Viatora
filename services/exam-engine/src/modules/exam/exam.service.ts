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
    const questions = await Promise.all([
      this.examRepository.getQuestionsByCategory({
        category,
        questionType: 'specialist',
        count: 5,
      }),
    ]);

    return questions.flat();
  }
}
