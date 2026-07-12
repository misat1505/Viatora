import { Inject, Injectable } from '@nestjs/common';
import { IQuestionsBankCache } from './questions-bank.cache.interface';
import Redis from 'ioredis';
import {
  ExamQuestion,
  DetailedExamQuestion,
  GetQuestionsRequest,
} from 'src/generated/content';
import { sha256 } from '../utils/sha256';

export const QUESTIONS_BANK_CACHE_TOKEN = Symbol('QUESTIONS_BANK_CACHE_TOKEN');

@Injectable()
export class QuestionsBankCache implements IQuestionsBankCache {
  private readonly prefix = 'content-service:questions';
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async getQuestionById(
    id: ExamQuestion['id'],
  ): Promise<DetailedExamQuestion | null> {
    const key = `${this.prefix}:id:${id}`;
    const question = await this.redis.get(key);
    if (!question) return null;
    return JSON.parse(question) as DetailedExamQuestion;
  }

  async getQuestionBySlug(
    slug: ExamQuestion['slug'],
  ): Promise<DetailedExamQuestion | null> {
    const key = `${this.prefix}:slug:${slug}`;
    const question = await this.redis.get(key);
    if (!question) return null;
    return JSON.parse(question) as DetailedExamQuestion;
  }

  async setQuestion(question: DetailedExamQuestion): Promise<void> {
    const value = JSON.stringify(question);

    await this.redis.mset({
      [`${this.prefix}:id:${question.id}`]: value,
      [`${this.prefix}:slug:${question.slug}`]: value,
    });
  }

  async getRandomQuestionIds(
    filters: GetQuestionsRequest,
  ): Promise<string[] | null> {
    const hash = await sha256(JSON.stringify(filters));
    const key = `${this.prefix}:filters:${hash}`;
    const exists = await this.redis.exists(key);
    if (!exists) return null;

    const ids = await this.redis.srandmember(key, filters.count);
    return ids;
  }

  async cacheQuestionFilter(
    filters: GetQuestionsRequest,
    ids: ExamQuestion['id'][],
  ): Promise<void> {
    const hash = await sha256(JSON.stringify(filters));
    const key = `${this.prefix}:filters:${hash}`;

    const pipeline = this.redis.pipeline();

    pipeline.sadd(key, ...ids);
    pipeline.expire(key, 60 * 60 * 24);

    await pipeline.exec();
  }

  async getQuestionsByIds(
    ids: ExamQuestion['id'][],
  ): Promise<(DetailedExamQuestion | null)[]> {
    const keys = ids.map((id) => `${this.prefix}:id:${id}`);
    const cached = await this.redis.mget(keys);
    const parsed = cached.map((q) => {
      if (!q) return null;
      return JSON.parse(q) as DetailedExamQuestion;
    });

    return parsed;
  }

  async cacheQuestions(questions: DetailedExamQuestion[]): Promise<void> {
    const pipeline = this.redis.pipeline();

    for (const question of questions) {
      pipeline.set(
        `${this.prefix}:id:${question.id}`,
        JSON.stringify(question),
      );
      pipeline.set(
        `${this.prefix}:slug:${question.slug}`,
        JSON.stringify(question),
      );
    }

    await pipeline.exec();
  }
}
