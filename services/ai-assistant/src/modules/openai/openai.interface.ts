import OpenAI from 'openai';

export interface IOpenAIService {
  chatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<string>;
}
