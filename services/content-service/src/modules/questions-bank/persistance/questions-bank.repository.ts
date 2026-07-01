import { Injectable } from '@nestjs/common';
import { IQuestionsBankRepository } from './questions-bank.repository.interface';
import {
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export const QUESTIONS_BANK_REPOSITORY_TOKEN = Symbol(
  'QUESTIONS_BANK_REPOSITORY_TOKEN',
);

@Injectable()
export class QuestionsBankRepository implements IQuestionsBankRepository {
  async getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']> {
    console.log('question bank repository hit', filters);
    // @ts-expect-error TODO: as for now it is not implemented
    return filters;
  }
}
