type AssistantRespondedDTO = {
  conversationId: string;
  userPrompt: string;
  assiatntReply: string;
};

export interface KafkaTopics {
  'assistant.responded': AssistantRespondedDTO;
}

export type KafkaTopic = keyof KafkaTopics;

export type KafkaPayload<T extends KafkaTopic> = KafkaTopics[T];
