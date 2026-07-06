import { Inject, Injectable } from '@nestjs/common';
import { QUESTIONS_BANK_REPOSITORY_TOKEN } from './persistance/questions-bank.repository';
import { type IQuestionsBankRepository } from './persistance/questions-bank.repository.interface';
import {
  GetQuestionBySlugRequest,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

@Injectable()
export class QuestionsBankService {
  constructor(
    @Inject(QUESTIONS_BANK_REPOSITORY_TOKEN)
    private readonly questionBankRepository: IQuestionsBankRepository,
  ) {}

  async getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse> {
    const questions =
      await this.questionBankRepository.getQuestionsByCategory(filters);
    return { questions, cacheHit: 'miss' };
  }

  async getQuestionBySlug(
    dto: GetQuestionBySlugRequest,
  ): Promise<GetQuestionBySlugRequest> {
    return this.questionBankRepository.getQuestionBySlug(dto.slug);
  }
}
