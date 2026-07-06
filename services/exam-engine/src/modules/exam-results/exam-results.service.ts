import { Inject, Injectable } from '@nestjs/common';
import {
  ExamQuestionWithAnswer,
  ExamSession,
  FinishSessionResponse,
} from 'src/generated/exam';
import { type IExamResultRepository } from './persistance/exam-result.repository.interface';
import { type IExamAnswerRepository } from './persistance/exam-answer.repository.interface';
import { EXAM_RESULT_REPOSITORY_TOKEN } from './persistance/exam-result.repository';
import { EXAM_ANSWER_REPOSITORY_TOKEN } from './persistance/exam-answer.repository';
import { ExamStatus } from './persistance/entities/exam-status';

@Injectable()
export class ExamResultsService {
  constructor(
    @Inject(EXAM_RESULT_REPOSITORY_TOKEN)
    private readonly resultRepo: IExamResultRepository,
    @Inject(EXAM_ANSWER_REPOSITORY_TOKEN)
    private readonly answerRepo: IExamAnswerRepository,
  ) {}

  async markExam(exam: ExamSession): Promise<FinishSessionResponse> {
    const answers = this.mapAnswers(exam.questions, exam.sessionId);

    const stats = this.calculateResult(exam.questions);

    const resultEntity = this.resultRepo.create({
      id: exam.sessionId,
      user_id: exam.userId,
      status: ExamStatus.COMPLETED,
      category: exam.category,
      total_questions: exam.totalQuestions,
      correct_answers: stats.correct,
      earned_points: stats.earned,
      max_points: stats.max,
      passed: stats.earned >= 68,
      time_limit_seconds: exam.timeLimitSeconds,
      started_at: new Date(exam.startedAt),
      completed_at: new Date(),
    });

    await this.resultRepo.save(resultEntity);
    await this.answerRepo.saveMany(answers);

    return {
      sessionId: resultEntity.id,
      userId: resultEntity.user_id,
      status: resultEntity.status,
      category: resultEntity.category,
      totalQuestions: resultEntity.total_questions,
      correctAnswers: resultEntity.correct_answers,
      earnedPoints: resultEntity.earned_points,
      maxPoints: resultEntity.max_points,
      scorePercent: Number(((stats.earned / stats.max) * 100).toFixed(2)),
      passed: resultEntity.passed,
      timeLimitSeconds: resultEntity.time_limit_seconds,
      startedAt: resultEntity.started_at.toISOString(),
      completedAt: resultEntity.completed_at.toISOString(),
    };
  }

  private calculateResult(questions: ExamQuestionWithAnswer[]) {
    let correct = 0;
    let earned = 0;
    let max = 0;

    for (const q of questions) {
      if (!q.question) continue;

      max += q.question.points;

      const isCorrect = q.question.answers?.correctAnswer === q.userAnswer;

      if (isCorrect) {
        correct++;
        earned += q.question.points;
      }
    }

    return { correct, earned, max };
  }

  private mapAnswers(
    questions: ExamQuestionWithAnswer[],
    sessionId: ExamSession['sessionId'],
  ) {
    return questions.map((q) =>
      this.answerRepo.create({
        id: crypto.randomUUID(),
        session_id: sessionId,
        question_id: q.question?.id,
        question_points: q.question?.points ?? 0,
        selected_option: q.userAnswer,
        correct_option: q.question?.answers?.correctAnswer ?? '',
        is_correct: q.question?.answers?.correctAnswer === q.userAnswer,
      }),
    );
  }
}
