import { Body, Controller } from '@nestjs/common';
import { ExamService } from './exam.service';
import { GrpcMethod } from '@nestjs/microservices';
import { StartSessionRequest, StartSessionResponse } from 'src/generated/exam';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @GrpcMethod('ExamService', 'StartSession')
  startExamSession(
    @Body() dto: StartSessionRequest,
  ): Promise<StartSessionResponse> {
    return this.examService.startExamSession(dto.category);
  }
}
