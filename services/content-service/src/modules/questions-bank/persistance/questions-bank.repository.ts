import { Injectable } from '@nestjs/common';
import {
  GetQuestionsFilters,
  IQuestionsBankRepository,
} from './questions-bank.repository.interface';

export const QUESTIONS_BANK_REPOSITORY_TOKEN = Symbol(
  'QUESTIONS_BANK_REPOSITORY_TOKEN',
);

@Injectable()
export class QuestionsBankRepository implements IQuestionsBankRepository {
  async getQuestionsByCategory(filters: GetQuestionsFilters) {
    console.log('question bank repository hit', filters);
    return filters;
  }
}
