import {
  DetailedExamQuestion,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export interface IQuestionsBankRepository {
  getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']>;

  getQuestionBySlug(slug: string): Promise<DetailedExamQuestion | null>;
  getQuestionById(id: string): Promise<DetailedExamQuestion | null>;

  getQuestionIdsByFilters(filters: GetQuestionsRequest): Promise<string[]>;
}
