export type GetQuestionsFilters = {
  category: string;
  questionType: string;
  count: number;
};

export interface IExamRepository {
  getQuestionsByCategory(filters: GetQuestionsFilters): Promise<any>;
}
