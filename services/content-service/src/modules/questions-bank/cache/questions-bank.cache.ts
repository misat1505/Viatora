import { Inject, Injectable } from '@nestjs/common';
import { IQuestionsBankCache } from './questions-bank.cache.interface';
import Redis from 'ioredis';
import { ExamQuestion, DetailedExamQuestion } from 'src/generated/content';

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
}
