import { Body, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuestionsBankService } from './questions-bank.service';
import { GetQuestionsRequest } from 'src/generated/content';

@Controller()
export class QuestionsBankController {
  constructor(private readonly questionsBankService: QuestionsBankService) {}

  @GrpcMethod('ContentService', 'GetQuestions')
  getQuestionsByCategory(@Body() dto: GetQuestionsRequest) {
    return this.questionsBankService.getQuestionsByCategory(dto);
  }
}
