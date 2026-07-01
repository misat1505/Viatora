export type GetQuestionsFilters = {
  category: string;
  questionType: string;
  count: number;
};

export interface IQuestionsBankRepository {
  getQuestionsByCategory(filters: GetQuestionsFilters): Promise<any>;
}
