import {
  ExamQuestion,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export interface IQuestionsBankRepository {
  getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']>;
  getQuestionBySlug(slug: string): Promise<ExamQuestion>;
}
