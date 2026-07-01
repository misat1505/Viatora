import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import { type IExamRepository } from './persistance/exam.repository.interface';
import { EXAMS_CONFIG } from './config/exams-config';
import { StartSessionResponse } from 'src/generated/exam';

@Injectable()
export class ExamService {
  constructor(
    @Inject(EXAM_REPOSITORY_TOKEN)
    private readonly examRepository: IExamRepository,
  ) {}

  async startExamSession(category: string): Promise<StartSessionResponse> {
    if (!Object.keys(EXAMS_CONFIG).includes(category))
      throw new BadRequestException(`Catgeory ${category} is not supported.`);

    const examConfiguration =
      EXAMS_CONFIG[category as keyof typeof EXAMS_CONFIG];

    const requests = examConfiguration.map((filter) =>
      this.examRepository.getQuestionsByCategory({ ...filter, category }),
    );

    const questions = await Promise.all(requests);

    const flattenedQuestions = questions.flat();

    const examSession: StartSessionResponse = {
      sessionId: 'uuid',
      timeLimitSeconds: 1500,
      totalQuestions: flattenedQuestions.length,
      startedAt: new Date().toISOString(),
      questions: flattenedQuestions,
    };

    return examSession;
  }
}
