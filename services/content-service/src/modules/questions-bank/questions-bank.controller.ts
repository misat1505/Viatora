import { Body, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuestionsBankService } from './questions-bank.service';
import {
  DetailedExamQuestion,
  GetQuestionBySlugRequest,
  GetQuestionsRequest,
  GetQuestionsResponse,
} from 'src/generated/content';

@Controller()
export class QuestionsBankController {
  constructor(private readonly questionsBankService: QuestionsBankService) {}

  @GrpcMethod('ContentService', 'GetQuestions')
  getQuestionsByCategory(
    @Body() dto: GetQuestionsRequest,
  ): Promise<GetQuestionsResponse> {
    return this.questionsBankService.getQuestionsByCategory(dto);
  }

  @GrpcMethod('ContentService', 'GetQuestionBySlug')
  getQuestionBySlug(
    @Body() dto: GetQuestionBySlugRequest,
  ): Promise<DetailedExamQuestion> {
    return this.questionsBankService.getQuestionBySlug(dto);
  }
}
