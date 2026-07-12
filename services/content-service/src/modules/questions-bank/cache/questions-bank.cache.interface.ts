import {
  DetailedExamQuestion,
  ExamQuestion,
  GetQuestionsRequest,
} from 'src/generated/content';

export interface IQuestionsBankCache {
  getQuestionById(id: ExamQuestion['id']): Promise<DetailedExamQuestion | null>;
  getQuestionBySlug(
    slug: ExamQuestion['slug'],
  ): Promise<DetailedExamQuestion | null>;
  setQuestion(question: DetailedExamQuestion): Promise<void>;
  getRandomQuestionIds(filters: GetQuestionsRequest): Promise<string[] | null>;
  cacheQuestionIds(
    filters: GetQuestionsRequest,
    ids: ExamQuestion['id'][],
  ): Promise<void>;
}
