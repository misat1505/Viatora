import { Body, Controller } from '@nestjs/common';
import { ExamService } from './exam.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @GrpcMethod('ExamService', 'StartSession')
  startExamSession(@Body() dto: any) {
    return this.examService.startExamSession(dto.category);
  }
}
