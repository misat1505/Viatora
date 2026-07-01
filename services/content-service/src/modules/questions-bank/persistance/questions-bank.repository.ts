import { Injectable, OnModuleInit } from '@nestjs/common';
import { IQuestionsBankRepository } from './questions-bank.repository.interface';
import {
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';
import { createClient, SanityClient } from '@sanity/client';
import { ConfigService } from '@nestjs/config';

export const QUESTIONS_BANK_REPOSITORY_TOKEN = Symbol(
  'QUESTIONS_BANK_REPOSITORY_TOKEN',
);

@Injectable()
export class QuestionsBankRepository
  implements IQuestionsBankRepository, OnModuleInit
{
  private sanityClient: SanityClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.sanityClient = createClient({
      projectId: this.configService.getOrThrow<string>('SANITY_PROJECT_ID'),
      dataset: this.configService.getOrThrow<string>('SANITY_DATASET'),
      apiVersion: '2024-01-01',
      token: this.configService.getOrThrow<string>('SANITY_TOKEN'),
      useCdn: false,
    });
  }
  async getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']> {
    console.log('question bank repository hit', filters);

    const { category, questionType, count } = filters;

    const query = `
      *[
        _type == "question" &&
        $category in categories &&
        questionType == $questionType
      ][0...$count]{
        _id,
        text,
        options,
        media,
        tags,
        categories,
        questionType
      }
    `;

    const result = await this.sanityClient.fetch(query, {
      category,
      questionType,
      count,
    });

    console.log(JSON.stringify(result, null, 2));

    return result;
  }
}
