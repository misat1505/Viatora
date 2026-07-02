import {
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export interface IQuestionsBankRepository {
  getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']>;
}
