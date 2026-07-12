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
  cacheQuestionFilter(
    filters: GetQuestionsRequest,
    ids: ExamQuestion['id'][],
  ): Promise<void>;
  getQuestionsByIds(
    ids: ExamQuestion['id'][],
  ): Promise<(DetailedExamQuestion | null)[]>;
  cacheQuestions(questions: DetailedExamQuestion[]): Promise<void>;
}
