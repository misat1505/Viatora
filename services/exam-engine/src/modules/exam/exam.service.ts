import { Inject, Injectable } from '@nestjs/common';
import { QUESTIONS_REPOSITORY_TOKEN } from './persistance/questions.repository';
import { type IQuestionsRepository } from './persistance/questions.repository.interface';
import {
  DEFAULT_EXAMS_CONFIGS_TOKEN,
  type ExamsConfigurations,
} from './config/exams-config';
import {
  ExamQuestionWithAnswer,
  ExamSession,
  FinishSessionRequest,
  FinishSessionResponse,
  GetSessionRequest,
  StartSessionRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from 'src/generated/exam';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import { type IExamRepository } from './persistance/exam.repository.interface';
import { ExamStatus } from './types/exam';
import { shuffleQuestions } from './utils/shuffle-questions';
import {
  ExamSessionNotFoundException,
  QuestionNotFoundException,
} from 'src/common/exceptions/not-found.exception';
import {
  CannotAnswerCurrentQuestionException,
  CannotFinishExamException,
  ExamCategoryNotSupportedException,
  InvalidAnswerForQuestionTypeException,
} from 'src/common/exceptions/bad-request.exception';
import { ExamInitializationException } from 'src/common/exceptions/internal.exception';
import { ExamResultsService } from '../exam-results/exam-results.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Injectable()
export class ExamService {
  constructor(
    @Inject(QUESTIONS_REPOSITORY_TOKEN)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(EXAM_REPOSITORY_TOKEN)
    private readonly examRepository: IExamRepository,
    @Inject(DEFAULT_EXAMS_CONFIGS_TOKEN)
    private readonly examsConfigurations: ExamsConfigurations,
    private readonly examResultsService: ExamResultsService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  async startExamSession(dto: StartSessionRequest): Promise<ExamSession> {
    const { category, userId } = dto;

    if (!Object.keys(this.examsConfigurations).includes(category))
      throw new ExamCategoryNotSupportedException(
        `Category ${category} is not supported.`,
      );

    const examConfiguration =
      this.examsConfigurations[category as keyof ExamsConfigurations];
    const examQuestionConfiguration = examConfiguration.questionsConfigs;

    const requests = examQuestionConfiguration.map((filter) =>
      this.questionsRepository.getQuestionsByCategory({ ...filter, category }),
    );

    const questions = await Promise.all(requests);

    const flattenedQuestions = questions.flat();

    if (examConfiguration.totalQuestions != flattenedQuestions.length) {
      throw new ExamInitializationException(
        `Invalid exam configuration for category=${category}. Expected ${examConfiguration.totalQuestions} questions, but got ${flattenedQuestions.length}.`,
      );
    }

    const shuffledQuestions = shuffleQuestions(flattenedQuestions);

    const questionsWithAnswers: ExamQuestionWithAnswer[] =
      shuffledQuestions.map((question) => ({
        question,
        userAnswer: '',
        answeredAt: '',
      }));

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

    await this.kafkaProducerService.produce('exam.started', examSession);

    return examSession;
  }

  async getSessionById(dto: GetSessionRequest): Promise<ExamSession> {
    const examSession = await this.examRepository.getById(dto.sessionId);
    if (!examSession) throw new ExamSessionNotFoundException();

    if (dto.userId !== examSession.userId)
      throw new ExamSessionNotFoundException();
    return examSession;
  }

  async submitAnswer(dto: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const exam = await this.examRepository.getById(dto.sessionId);
    if (!exam || exam.userId !== dto.userId)
      throw new ExamSessionNotFoundException();

    const currentQuestion = exam.questions.find(
      (q) => q.question?.id === dto.questionId,
    );
    if (!currentQuestion) throw new QuestionNotFoundException();

    if (exam.currentQuestionId !== dto.questionId)
      throw new CannotAnswerCurrentQuestionException();

    const isInvalidAnswerForBasicQuestion =
      currentQuestion.question?.questionType === 'basic' &&
      dto.selectedOption === 'c';
    if (isInvalidAnswerForBasicQuestion)
      throw new InvalidAnswerForQuestionTypeException();

    const secondsRemaining =
      (Date.now() - new Date(exam.startedAt).getTime()) / 1000;
    // TODO: uncomment this when it stops to be annoying for dev
    // if (secondsRemaining < 0) throw new BadRequestException('Time has elapsed');

    currentQuestion.userAnswer = dto.selectedOption;
    currentQuestion.answeredAt = new Date().toISOString();
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

    const isCorrect =
      exam.questions[currentQuestionAbsoluteId].question?.answers
        ?.correctAnswer === dto.selectedOption;

    await this.kafkaProducerService.produce('exam.answer.submitted', {
      sessionId: exam.sessionId,
      userId: exam.userId,
      questionId: dto.questionId,
      answer: dto.selectedOption,
      answeredAt: currentQuestion.answeredAt,
      isCorrect,
      questionNumber: currentQuestionAbsoluteId + 1,
      totalQuestions: exam.totalQuestions,
    });

    return {
      accepted: true,
      answeredCount: currentQuestionAbsoluteId + 1,
      totalQuestions: exam.totalQuestions,
      secondsRemaining,
    };
  }

  async finishSession(
    dto: FinishSessionRequest,
  ): Promise<FinishSessionResponse> {
    const exam = await this.getSessionById(dto);

    if (exam.currentQuestionId !== 'STOP')
      throw new CannotFinishExamException(
        'Not all questions have been answered to',
      );

    const examResult = await this.examResultsService.markExam(exam);

    await this.kafkaProducerService.produce('exam.finished', examResult);

    return examResult;
  }
}
