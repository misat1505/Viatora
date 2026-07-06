import { Injectable, OnModuleInit } from '@nestjs/common';
import { IQuestionsBankRepository } from './questions-bank.repository.interface';
import {
  DetailedExamQuestion,
  ExamQuestion,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';
import { createClient, SanityClient } from '@sanity/client';
import { ConfigService } from '@nestjs/config';

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

    const questions = (result as any[]).map((entry) => {
      const question: ExamQuestion = {
        id: entry._id,
        categories: entry.categories,
        slug: entry.slug.current,
        points: entry.points,
        media: {
          type: entry.media.type,
          url: entry.media?.image?.asset?._ref ?? '',
        },
        answers: { ...entry.options, correctAnswer: entry.correctOption },
        questionType: entry.questionType,
        tags: entry.tags,
        text: entry.text,
      };

      return question;
    });

    return questions;
  }

  async getQuestionBySlug(slug: string): Promise<DetailedExamQuestion> {
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
      throw new Error(`Question with slug "${slug}" not found`);
    }

    const question: DetailedExamQuestion = {
      id: fetchedQuestion._id,
      categories: fetchedQuestion.categories,
      slug: fetchedQuestion.slug.current,
      points: fetchedQuestion.points,
      media: {
        type: fetchedQuestion.media.type,
        url: fetchedQuestion.media?.image?.asset?._ref ?? '',
      },
      answers: {
        ...fetchedQuestion.options,
        correctAnswer: fetchedQuestion.correctOption,
      },
      questionType: fetchedQuestion.questionType,
      tags: fetchedQuestion.tags,
      text: fetchedQuestion.text,
      explanation: fetchedQuestion.explanation,
    };

    return question;
  }
}
