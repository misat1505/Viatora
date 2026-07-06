import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamResultEntity } from './persistance/entities/exam-result.entity';
import { ExamAnswerEntity } from './persistance/entities/exam-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamResultEntity, ExamAnswerEntity])],
  providers: [ExamResultsService],
  exports: [ExamResultsService],
})
export class ExamResultsModule {}
