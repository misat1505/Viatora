import { Injectable, OnModuleInit } from '@nestjs/common';
import { IQuestionsBankRepository } from './questions-bank.repository.interface';
import {
  DetailedExamQuestion,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';
import { createClient, SanityClient } from '@sanity/client';
import { ConfigService } from '@nestjs/config';
import { parseDetailedQuestion, parseQuestion } from '../utils/parse-question';

export const QUESTIONS_BANK_REPOSITORY_TOKEN = Symbol(
  'QUESTIONS_BANK_REPOSITORY_TOKEN',
);

@Injectable()
export class QuestionsBankRepository
  implements IQuestionsBankRepository, OnModuleInit
{
  private sanityClient!: SanityClient;

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
    const { category, questionType, count, points } = filters;

    const query = `
      *[
        _type == "question" &&
        !(_id in path("drafts.**")) &&
        $category in categories &&
        questionType == $questionType &&
        points == $points
      ][0...$count]{
        _id,
        text,
        slug,
        points,
        options,
        media,
        tags,
        categories,
        questionType,
        correctOption
      }
    `;

    const result = await this.sanityClient.fetch(query, {
      category,
      questionType,
      count,
      points,
    });

    const questions = (result as any[]).map(parseQuestion);

    return questions;
  }

  async getQuestionBySlug(slug: string): Promise<DetailedExamQuestion | null> {
    const query = `
      *[
        _type == "question" &&
        !(_id in path("drafts.**")) &&
        slug.current == $slug
      ][0]{
        _id,
        text,
        slug,
        points,
        options,
        media,
        tags,
        categories,
        questionType,
        correctOption,
        explanation
      }
    `;

    const fetchedQuestion = await this.sanityClient.fetch(query, { slug });

    if (!fetchedQuestion) {
      return null;
    }

    return parseDetailedQuestion(fetchedQuestion);
  }

  async getQuestionById(id: string): Promise<DetailedExamQuestion | null> {
    const query = `
    *[
      _type == "question" &&
      !(_id in path("drafts.**")) &&
      _id == $id
    ][0]{
      _id,
      text,
      slug,
      points,
      options,
      media,
      tags,
      categories,
      questionType,
      correctOption,
      explanation
    }
  `;

    const fetchedQuestion = await this.sanityClient.fetch(query, { id });

    if (!fetchedQuestion) {
      return null;
    }

    return parseDetailedQuestion(fetchedQuestion);
  }

  async getQuestionIdsByFilters(
    filters: GetQuestionsRequest,
  ): Promise<string[]> {
    return this.sanityClient.fetch<string[]>(
      `
      *[
        _type == "question" &&
        !(_id in path("drafts.**")) &&
        $category in categories &&
        questionType == $questionType &&
        points == $points
      ]._id
      `,
      filters,
    );
  }
}
