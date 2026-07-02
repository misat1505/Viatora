import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import {
  QUESTIONS_REPOSITORY_TOKEN,
  QuestionsRepository,
} from './persistance/questions.repository';
import { GrpcClientsModule } from 'src/grpc/clients.module';

@Module({
  imports: [GrpcClientsModule],
  controllers: [ExamController],
  providers: [
    ExamService,
    { provide: QUESTIONS_REPOSITORY_TOKEN, useClass: QuestionsRepository },
  ],
})
export class ExamModule {}
