import { Inject, Injectable } from '@nestjs/common';
import { QUESTIONS_BANK_REPOSITORY_TOKEN } from './persistance/questions-bank.repository';
import { type IQuestionsBankRepository } from './persistance/questions-bank.repository.interface';
import {
  DetailedExamQuestion,
  ExamQuestion,
  GetQuestionByIdRequest,
  GetQuestionBySlugRequest,
  GetQuestionsByFiltersRequest,
  GetQuestionsByFiltersResponse,
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
    const questionsIds = await this.getRandomQuestionIds(filters);
    const [questions, cacheHit] = await this.getQuestionsByIds(questionsIds);
    return { questions, cacheHit };
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

  async getQuestionsByFilters(
    filters: GetQuestionsByFiltersRequest,
  ): Promise<GetQuestionsByFiltersResponse> {
    const questions = await this.questionBankRepository.getQuestionsByFilters({
      lang: filters.lang ?? 'en',
      limit: filters.limit ?? 10,
      page: filters.page ?? 1,
      points: filters.points ?? null,
      tags: filters.tags ?? [],
    });
    return { questions };
  }

  private async getRandomQuestionIds(
    filters: GetQuestionsRequest,
  ): Promise<ExamQuestion['id'][]> {
    const idsFromCache =
      await this.questionBankCache.getRandomQuestionIds(filters);
    if (idsFromCache) return idsFromCache;

    const fetchedIds =
      await this.questionBankRepository.getQuestionIdsByFilters(filters);
    await this.questionBankCache.cacheQuestionFilter(filters, fetchedIds);

    const ids = await this.questionBankCache.getRandomQuestionIds(filters);
    if (!ids) throw new Error('Questions not found');

    return ids;
  }

  private async getQuestionsByIds(
    ids: ExamQuestion['id'][],
  ): Promise<[ExamQuestion[], GetQuestionsResponse['cacheHit']]> {
    const cacheResponse = await this.questionBankCache.getQuestionsByIds(ids);

    const result = new Map<string, DetailedExamQuestion>();
    const missingIds: string[] = [];

    cacheResponse.forEach((value, index) => {
      if (value) {
        result.set(ids[index], value);
      } else {
        missingIds.push(ids[index]);
      }
    });

    let cacheHit: GetQuestionsResponse['cacheHit'] = 'hit';

    if (missingIds.length > 0) {
      cacheHit = 'miss';

      const missingQuestions =
        await this.questionBankRepository.getQuestionsByIds(missingIds);

      await this.questionBankCache.cacheQuestions(missingQuestions);

      missingQuestions.forEach((question) => {
        result.set(question.id, question);
      });
    }

    const detailedQuestions = ids
      .map((id) => result.get(id))
      .filter(Boolean) as DetailedExamQuestion[];
    const questions: ExamQuestion[] = detailedQuestions.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ explanation, ...rest }) => rest,
    );
    return [questions, cacheHit];
  }
}
