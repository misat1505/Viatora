import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { IOpenAIService } from './openai.interface';

export const OPENAI_SERVICE = Symbol('OPENAI_SERVICE');

@Injectable()
export class OpenAIService implements IOpenAIService {
  private readonly client: OpenAI;

  constructor(configService: ConfigService) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: configService.getOrThrow<string>('OPENROUTER_API_KEY'),
    });
  }

  async chatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'openrouter/free',
      messages,
    });

    return completion.choices[0].message.content ?? '';
  }
}
