import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { QUESTIONS_REPOSITORY_TOKEN } from './persistance/questions.repository';
import { type IQuestionsRepository } from './persistance/questions.repository.interface';
import { EXAMS_CONFIG } from './config/exams-config';
import {
  ExamQuestionWithAnswer,
  ExamSession,
  StartSessionRequest,
} from 'src/generated/exam';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import { type IExamRepository } from './persistance/exam.repository.interface';

@Injectable()
export class ExamService {
  constructor(
    @Inject(QUESTIONS_REPOSITORY_TOKEN)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(EXAM_REPOSITORY_TOKEN)
    private readonly examRepository: IExamRepository,
  ) {}

  async startExamSession(dto: StartSessionRequest): Promise<ExamSession> {
    const { category, userId } = dto;

    if (!Object.keys(EXAMS_CONFIG).includes(category))
      throw new BadRequestException(`Catgeory ${category} is not supported.`);

    const examConfiguration =
      EXAMS_CONFIG[category as keyof typeof EXAMS_CONFIG];

    const requests = examConfiguration.map((filter) =>
      this.questionsRepository.getQuestionsByCategory({ ...filter, category }),
    );

    const questions = await Promise.all(requests);

    const flattenedQuestions = questions.flat();
    const questionsWithAnswers: ExamQuestionWithAnswer[] =
      flattenedQuestions.map((question) => ({ question, userAnswer: '' }));

    const examSessionDTO: Omit<ExamSession, 'sessionId'> = {
      userId,
      timeLimitSeconds: 1500,
      totalQuestions: flattenedQuestions.length,
      startedAt: new Date().toISOString(),
      questions: questionsWithAnswers,
    };

    const examSession =
      await this.examRepository.createExamSession(examSessionDTO);

    return examSession;
  }
}
