import { FinishSessionResponse } from 'src/generated/exam';

export interface KafkaTopics {
  'exam.finished': FinishSessionResponse;
}

export type KafkaTopic = keyof KafkaTopics;

export type KafkaPayload<T extends KafkaTopic> = KafkaTopics[T];
