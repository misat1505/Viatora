import {
  ExamSessionDTO,
  ExamQuestionDTO,
  ExamQuestionWithAnswerDTO,
  LocaleDTO,
  MediaDTO,
  AnswersDTO,
} from '../start-exam.dto';
import { AnswerQuestionResponseDTO } from '../answer-question.dto';
import { SubmitExamResponseDTO } from '../submit-exam.dto';
import { GetExamsResultsResponseDTO } from '../get-exams-results.dto';
import { Answers, ExamQuestion, Locale, Media } from 'src/generated/content';
import { GrpcResponse } from 'src/grpc/types/grpc-client';
import {
  ExamQuestionWithAnswer,
  ExamServiceClient,
  ExamSession,
} from 'src/generated/exam';

type SubmitAnswerResponse = GrpcResponse<ExamServiceClient, 'submitAnswer'>;
type FinishSessionResponse = GrpcResponse<ExamServiceClient, 'finishSession'>;
type ListResultsResponse = GrpcResponse<ExamServiceClient, 'listResults'>;

export class ExamsMapper {
  static toLocaleDTO(locale?: Locale): LocaleDTO {
    return {
      pl: locale?.pl ?? '',
      en: locale?.en ?? '',
    };
  }

  static toMediaDTO(media?: Media): MediaDTO {
    return {
      type: media?.type ?? 'none',
      url: media?.url ?? '',
    };
  }

  static toAnswersDTO(answers?: Answers): AnswersDTO {
    return {
      a: this.toLocaleDTO(answers?.a),
      b: this.toLocaleDTO(answers?.b),
      c: this.toLocaleDTO(answers?.c),
      correctAnswer: answers?.correctAnswer ?? '',
    };
  }

  static toQuestionDTO(question?: ExamQuestion): ExamQuestionDTO {
    return {
      id: question?.id ?? '',
      slug: question?.slug ?? '',
      categories: question?.categories ?? [],
      questionType: question?.questionType ?? 'basic',
      text: this.toLocaleDTO(question?.text),
      answers: this.toAnswersDTO(question?.answers),
      points: question?.points ?? 0,
      tags: question?.tags ?? [],
      media: this.toMediaDTO(question?.media),
    };
  }

  static toQuestionWithAnswerDTO(
    item: ExamQuestionWithAnswer,
  ): ExamQuestionWithAnswerDTO {
    return {
      question: this.toQuestionDTO(item.question),
      userAnswer: item.userAnswer ?? '',
      answeredAt: item.answeredAt ?? '',
    };
  }

  static toExamSessionDTO(session: ExamSession): ExamSessionDTO {
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      timeLimitSeconds: session.timeLimitSeconds,
      totalQuestions: session.totalQuestions,
      startedAt: session.startedAt,
      category: session.category,
      currentQuestionId: session.currentQuestionId,
      status: session.status,
      questions: session.questions.map((q) => this.toQuestionWithAnswerDTO(q)),
    };
  }

  static toAnswerQuestionResponseDTO(
    result: SubmitAnswerResponse,
  ): AnswerQuestionResponseDTO {
    return {
      accepted: result.accepted,
      answeredCount: result.answeredCount,
      totalQuestions: result.totalQuestions,
      secondsRemaining: result.secondsRemaining,
    };
  }

  static toSubmitExamResponseDTO(
    result: FinishSessionResponse,
  ): SubmitExamResponseDTO {
    return {
      sessionId: result.sessionId,
      userId: result.userId,
      status: result.status,
      category: result.category,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      earnedPoints: result.earnedPoints,
      maxPoints: result.maxPoints,
      passed: result.passed,
      timeLimitSeconds: result.timeLimitSeconds,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      scorePercent: result.scorePercent,
      answers: result.answers ?? [],
    };
  }

  static toGetExamsResultsResponseDTO(
    result: ListResultsResponse,
  ): GetExamsResultsResponseDTO {
    return {
      exams: result.exams.map((r) => this.toSubmitExamResponseDTO(r)),
    };
  }
}
