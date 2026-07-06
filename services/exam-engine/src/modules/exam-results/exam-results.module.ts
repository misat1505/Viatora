import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamResultEntity } from './persistance/entities/exam-result.entity';
import { ExamAnswerEntity } from './persistance/entities/exam-answer.entity';
import {
  EXAM_RESULT_REPOSITORY_TOKEN,
  ExamResultRepository,
} from './persistance/exam-result.repository';
import {
  EXAM_ANSWER_REPOSITORY_TOKEN,
  ExamAnswerRepository,
} from './persistance/exam-answer.repository';
import { ExamResultsController } from './exam-results.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamResultEntity, ExamAnswerEntity])],
  providers: [
    ExamResultsService,
    {
      provide: EXAM_RESULT_REPOSITORY_TOKEN,
      useClass: ExamResultRepository,
    },
    {
      provide: EXAM_ANSWER_REPOSITORY_TOKEN,
      useClass: ExamAnswerRepository,
    },
  ],
  controllers: [ExamResultsController],
  exports: [ExamResultsService],
})
export class ExamResultsModule {}
