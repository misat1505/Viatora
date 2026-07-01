import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import { type IExamRepository } from './persistance/exam.repository.interface';
import { EXAMS_CONFIG } from './config/exams-config';

@Injectable()
export class ExamService {
  constructor(
    @Inject(EXAM_REPOSITORY_TOKEN)
    private readonly examRepository: IExamRepository,
  ) {}

  async startExamSession(category: string) {
    if (!Object.keys(EXAMS_CONFIG).includes(category))
      throw new BadRequestException(`Catgeory ${category} is not supported.`);

    const examConfiguration =
      EXAMS_CONFIG[category as keyof typeof EXAMS_CONFIG];

    const requests = examConfiguration.map((filter) =>
      this.examRepository.getQuestionsByCategory({ ...filter, category }),
    );

    const questions = await Promise.all(requests);

    return questions.flat();
  }
}
