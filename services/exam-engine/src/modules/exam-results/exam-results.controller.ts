import { Body, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetResultRequest, GetResultResponse } from 'src/generated/exam';
import { ExamResultsService } from './exam-results.service';

@Controller()
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  @GrpcMethod('ExamService', 'GetResult')
  getExamResult(@Body() dto: GetResultRequest): Promise<GetResultResponse> {
    return this.examResultsService.getExamResult(dto);
  }
}
