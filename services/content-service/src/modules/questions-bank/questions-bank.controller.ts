import { Body, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuestionsBankService } from './questions-bank.service';

@Controller()
export class QuestionsBankController {
  constructor(private readonly questionsBankService: QuestionsBankService) {}

  @GrpcMethod('ContentService', 'GetQuestions')
  getQuestionsByCategory(@Body() dto: any) {
    return this.questionsBankService.getQuestionsByCategory(dto);
  }
}
