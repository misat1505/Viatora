import {
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

export interface IQuestionsRepository {
  getQuestionsByCategory(
    filters: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse['questions']>;
}
