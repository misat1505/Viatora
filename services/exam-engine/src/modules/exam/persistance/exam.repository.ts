import { Injectable } from '@nestjs/common';
import {
  GetQuestionsFilters,
  IExamRepository,
} from './exam.repository.interface';

export const EXAM_REPOSITORY_TOKEN = Symbol('EXAM_REPOSITORY_TOKEN');

@Injectable()
export class ExamRepository implements IExamRepository {
  async getQuestionsByCategory(filters: GetQuestionsFilters) {
    console.log(filters);
    return;
  }
}
