import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import {
  QUESTIONS_REPOSITORY_TOKEN,
  QuestionsRepository,
} from './persistance/questions.repository';
import { GrpcClientsModule } from 'src/grpc/clients.module';
import {
  EXAM_REPOSITORY_TOKEN,
  ExamRepository,
} from './persistance/exam.repository';

@Module({
  imports: [GrpcClientsModule],
  controllers: [ExamController],
  providers: [
    ExamService,
    { provide: QUESTIONS_REPOSITORY_TOKEN, useClass: QuestionsRepository },
    { provide: EXAM_REPOSITORY_TOKEN, useClass: ExamRepository },
  ],
})
export class ExamModule {}
