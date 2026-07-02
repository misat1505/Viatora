import { Body, Controller } from '@nestjs/common';
import { ExamService } from './exam.service';
import { GrpcMethod } from '@nestjs/microservices';
import { StartSessionRequest, ExamSession } from 'src/generated/exam';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @GrpcMethod('ExamService', 'StartSession')
  startExamSession(@Body() dto: StartSessionRequest): Promise<ExamSession> {
    return this.examService.startExamSession(dto);
  }
}
