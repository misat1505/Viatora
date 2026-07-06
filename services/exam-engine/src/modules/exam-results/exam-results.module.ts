import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';

@Module({
  providers: [ExamResultsService],
  exports: [ExamResultsService],
})
export class ExamResultsModule {}
