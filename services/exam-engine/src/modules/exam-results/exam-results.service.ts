import { Injectable } from '@nestjs/common';
import { ExamSession, FinishSessionResponse } from 'src/generated/exam';

@Injectable()
export class ExamResultsService {
  async markExam(exam: ExamSession): Promise<FinishSessionResponse> {
    const examResult: FinishSessionResponse = {
      sessionId: 'b5b3c3d2-4f18-4dcb-9b4e-f6cb7d34e53d',
      userId: '2efbcb6a-7db7-4946-a40d-8b8f6eb5d6e7',
      status: 'completed',
      category: 'B',
      totalQuestions: 32,
      correctAnswers: 30,
      earnedPoints: 70,
      maxPoints: 74,
      scorePercent: Number(((70 / 74) * 100).toFixed(2)),
      passed: true,
      timeLimitSeconds: 1500,
      startedAt: '2026-07-06T08:45:00.000Z',
      completedAt: '2026-07-06T09:08:42.000Z',
    };

    return examResult;
  }
}
