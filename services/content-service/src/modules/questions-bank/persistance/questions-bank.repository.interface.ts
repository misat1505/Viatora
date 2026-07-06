import {
  DetailedExamQuestion,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export interface IQuestionsBankRepository {
  getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  getQuestionBySlug(slug: string): Promise<DetailedExamQuestion | null>;
}
