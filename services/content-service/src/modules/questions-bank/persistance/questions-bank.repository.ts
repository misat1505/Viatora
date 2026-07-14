import { Injectable, OnModuleInit } from '@nestjs/common';
import { IQuestionsBankRepository } from './questions-bank.repository.interface';
import {
  DetailedExamQuestion,
  GetQuestionsByFiltersRequest,
  GetQuestionsRequest,
} from 'src/generated/content';
import { createClient, SanityClient } from '@sanity/client';
import { ConfigService } from '@nestjs/config';
import { parseDetailedQuestion } from '../utils/parse-question';

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

  async getQuestionsByIds(ids: string[]): Promise<DetailedExamQuestion[]> {
    const query = `
      *[
        _type == "question" &&
        _id in $ids
      ]{
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

    const questions = await this.sanityClient.fetch<any[]>(query, { ids });

    return questions.map(parseDetailedQuestion);
  }

  async getQuestionsByFilters(
    filters: GetQuestionsByFiltersRequest,
  ): Promise<DetailedExamQuestion[]> {
    const { lang = 'en', limit = 10, page = 1, points, tags = [] } = filters;

    const start = (page - 1) * limit;
    const end = start + limit;

    const query = `
      *[
        _type == "question" &&
        !(_id in path("drafts.**"))
        ${points ? '&& points == $points' : ''}
        ${tags.length ? '&& count(tags[@ in $tags]) == length($tags)' : ''}
      ]
      | order(text[$lang] asc)
      [$start...$end]
      {
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

    const params = {
      lang,
      points,
      tags,
      start,
      end,
    };

    const questions = await this.sanityClient.fetch<any[]>(query, params);

    return questions.map(parseDetailedQuestion);
  }
}
