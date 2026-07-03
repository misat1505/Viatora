import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QUESTIONS_REPOSITORY_TOKEN } from './persistance/questions.repository';
import { type IQuestionsRepository } from './persistance/questions.repository.interface';
import {
  DEFAULT_EXAMS_CONFIGS_TOKEN,
  type ExamsConfigurations,
} from './config/exams-config';
import {
  ExamQuestionWithAnswer,
  ExamSession,
  GetSessionRequest,
  StartSessionRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from 'src/generated/exam';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import { type IExamRepository } from './persistance/exam.repository.interface';
import { ExamStatus } from './types/exam';
import { shuffleQuestions } from './utils/shuffle-questions';

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
      throw new InternalServerErrorException(
        `Invalid exam configuration for category=${category}. Expected ${examConfiguration.totalQuestions} questions, but got ${flattenedQuestions.length}.`,
      );
    }

    const shuffledQuestions = shuffleQuestions(flattenedQuestions);

    const questionsWithAnswers: ExamQuestionWithAnswer[] =
      shuffledQuestions.map((question) => ({ question, userAnswer: '' }));

    const examSessionDTO: Omit<ExamSession, 'sessionId'> = {
      userId,
      timeLimitSeconds: examConfiguration.duration,
      totalQuestions: questionsWithAnswers.length,
      startedAt: new Date().toISOString(),
      questions: questionsWithAnswers,
      category: dto.category,
      currentQuestionId: questionsWithAnswers[0].question!.id,
      status: ExamStatus.IN_PROGRESS,
    };

    const examSession =
      await this.examRepository.createExamSession(examSessionDTO);

    return examSession;
  }

  async getSessionById(dto: GetSessionRequest): Promise<ExamSession> {
    const examSession = await this.examRepository.getById(dto.sessionId);
    if (!examSession) throw new NotFoundException();

    if (dto.userId !== examSession.userId) throw new NotFoundException();
    return examSession;
  }

  async submitAnswer(dto: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const exam = await this.examRepository.getById(dto.sessionId);
    if (!exam || exam.userId !== dto.userId)
      throw new NotFoundException('Exam not found.');

    const currentQuestion = exam.questions.find(
      (q) => q.question?.id === dto.questionId,
    );
    if (!currentQuestion) throw new NotFoundException('Question not found.');

    if (exam.currentQuestionId !== dto.questionId)
      throw new BadRequestException(
        'Cannot answer to this question right now.',
      );

    const isInvalidAnswerForBasicQuestion =
      currentQuestion.question?.questionType === 'basic' &&
      dto.selectedOption === 'c';
    if (isInvalidAnswerForBasicQuestion)
      throw new BadRequestException("Invalid answer for 'basic' question.");

    const secondsRemaining =
      (Date.now() - new Date(exam.startedAt).getTime()) / 1000;
    // TODO: uncomment this when it stops to be annoying for dev
    // if (secondsRemaining < 0) throw new BadRequestException('Time has elapsed');

    currentQuestion.userAnswer = dto.selectedOption;
    const currentQuestionAbsoluteId = exam.questions.findIndex(
      (q) => q.question?.id === dto.questionId,
    );

    const nextQuestionAbsoluteId = currentQuestionAbsoluteId + 1;

    const nextQuestionId =
      nextQuestionAbsoluteId >= exam.totalQuestions
        ? 'STOP'
        : exam.questions[nextQuestionAbsoluteId].question!.id;
    exam.currentQuestionId = nextQuestionId;

    await this.examRepository.updateById(exam.sessionId, exam);

    return {
      accepted: true,
      answeredCount: currentQuestionAbsoluteId + 1,
      totalQuestions: exam.totalQuestions,
      secondsRemaining,
    };
  }
}
