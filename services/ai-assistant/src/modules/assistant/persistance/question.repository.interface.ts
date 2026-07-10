import {
  DetailedExamQuestion,
  GetQuestionByIdRequest,
} from 'src/generated/content';

export interface IQuestionRepository {
  getQuestionsById(
    id: GetQuestionByIdRequest['id'],
  ): Promise<DetailedExamQuestion | null>;
}
