import { ExamSession, FinishSessionResponse } from 'src/generated/exam';

type ExamAnswerSubmittedDTO = {
  sessionId: string;
  userId: string;
  questionId: string;
  answer: string;
  answeredAt: string;
  isCorrect: boolean;
  questionNumber: number;
  totalQuestions: number;
};

export interface KafkaTopics {
  'exam.started': ExamSession;
  'exam.finished': FinishSessionResponse;
  'exam.answer.submitted': ExamAnswerSubmittedDTO;
}

export type KafkaTopic = keyof KafkaTopics;

export type KafkaPayload<T extends KafkaTopic> = KafkaTopics[T];
