import {
  DetailedExamQuestion,
  GetQuestionsByFiltersRequest,
  GetQuestionsRequest,
} from 'src/generated/content';

export interface IQuestionsBankRepository {
  getQuestionBySlug(slug: string): Promise<DetailedExamQuestion | null>;
  getQuestionById(id: string): Promise<DetailedExamQuestion | null>;

  getQuestionIdsByFilters(filters: GetQuestionsRequest): Promise<string[]>;
  getQuestionsByIds(ids: string[]): Promise<DetailedExamQuestion[]>;

  getQuestionsByFilters(
    filters: GetQuestionsByFiltersRequest,
  ): Promise<DetailedExamQuestion[]>;
}
