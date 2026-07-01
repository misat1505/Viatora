import {
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export interface IExamRepository {
  getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']>;
}
