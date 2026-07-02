import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { QUESTIONS_REPOSITORY_TOKEN } from './persistance/questions.repository';
import { type IQuestionsRepository } from './persistance/questions.repository.interface';
import {
  DEFAULT_EXAMS_CONFIGS_TOKEN,
  type ExamsConfigurations,
} from './config/exams-config';
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
    @Inject(DEFAULT_EXAMS_CONFIGS_TOKEN)
    private readonly examsConfigurations: ExamsConfigurations,
  ) {}

  async startExamSession(dto: StartSessionRequest): Promise<ExamSession> {
    const { category, userId } = dto;

    if (!Object.keys(this.examsConfigurations).includes(category))
      throw new BadRequestException(`Category ${category} is not supported.`);

    const examConfiguration =
      this.examsConfigurations[category as keyof ExamsConfigurations];
    const examQuestionConfiguration = examConfiguration.questionsConfigs;

    const requests = examQuestionConfiguration.map((filter) =>
      this.questionsRepository.getQuestionsByCategory({ ...filter, category }),
    );

    const questions = await Promise.all(requests);

    const flattenedQuestions = questions.flat();

    if (examConfiguration.totalQuestions != flattenedQuestions.length) {
      // TODO: raise an error, for now just a log
      console.warn(
        `Invalid exam configuration for category=${category}. Expected ${examConfiguration.totalQuestions} questions, but got ${flattenedQuestions.length}.`,
      );
    }

    const questionsWithAnswers: ExamQuestionWithAnswer[] =
      flattenedQuestions.map((question) => ({ question, userAnswer: '' }));

    const examSessionDTO: Omit<ExamSession, 'sessionId'> = {
      userId,
      timeLimitSeconds: examConfiguration.duration,
      totalQuestions: flattenedQuestions.length,
      startedAt: new Date().toISOString(),
      questions: questionsWithAnswers,
    };

    const examSession =
      await this.examRepository.createExamSession(examSessionDTO);

    return examSession;
  }
}
