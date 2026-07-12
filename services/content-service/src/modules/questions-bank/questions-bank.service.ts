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
import { QUESTIONS_BANK_CACHE_TOKEN } from './cache/questions-bank.cache';
import { type IQuestionsBankCache } from './cache/questions-bank.cache.interface';

@Injectable()
export class QuestionsBankService {
  constructor(
    @Inject(QUESTIONS_BANK_REPOSITORY_TOKEN)
    private readonly questionBankRepository: IQuestionsBankRepository,
    @Inject(QUESTIONS_BANK_CACHE_TOKEN)
    private readonly questionBankCache: IQuestionsBankCache,
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
    const { slug } = dto;

    const cachedQuestion = await this.questionBankCache.getQuestionBySlug(slug);
    if (cachedQuestion) return cachedQuestion;

    const question = await this.questionBankRepository.getQuestionBySlug(slug);
    if (!question) throw new QuestionNotFoundException();

    await this.questionBankCache.setQuestion(question);

    return question;
  }

  async getQuestionById(
    dto: GetQuestionByIdRequest,
  ): Promise<DetailedExamQuestion> {
    const { id } = dto;

    const cachedQuestion = await this.questionBankCache.getQuestionById(id);
    if (cachedQuestion) return cachedQuestion;

    const question = await this.questionBankRepository.getQuestionById(id);
    if (!question) throw new QuestionNotFoundException();

    await this.questionBankCache.setQuestion(question);

    return question;
  }
}
