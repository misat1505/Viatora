import { Inject, Injectable } from '@nestjs/common';
import { QUESTIONS_BANK_REPOSITORY_TOKEN } from './persistance/questions-bank.repository';
import { type IQuestionsBankRepository } from './persistance/questions-bank.repository.interface';
import {
  DetailedExamQuestion,
  GetQuestionByIdRequest,
  GetQuestionBySlugRequest,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';
import { QuestionNotFoundException } from 'src/common/exceptions/not-found.exception';

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
  ): Promise<DetailedExamQuestion> {
    const question = await this.questionBankRepository.getQuestionBySlug(
      dto.slug,
    );
    if (!question) throw new QuestionNotFoundException();

    return question;
  }

  async getQuestionById(
    dto: GetQuestionByIdRequest,
  ): Promise<DetailedExamQuestion> {
    const question = await this.questionBankRepository.getQuestionById(dto.id);
    if (!question) throw new QuestionNotFoundException();

    return question;
  }
}
