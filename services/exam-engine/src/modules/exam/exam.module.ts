import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import {
  EXAM_REPOSITORY_TOKEN,
  ExamRepository,
} from './persistance/exam.repository';

@Module({
  controllers: [ExamController],
  providers: [
    ExamService,
    { provide: EXAM_REPOSITORY_TOKEN, useClass: ExamRepository },
  ],
})
export class ExamModule {}
