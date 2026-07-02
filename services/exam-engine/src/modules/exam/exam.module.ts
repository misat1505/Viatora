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
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [GrpcClientsModule],
  controllers: [ExamController],
  providers: [
    ExamService,
    { provide: QUESTIONS_REPOSITORY_TOKEN, useClass: QuestionsRepository },
    { provide: EXAM_REPOSITORY_TOKEN, useClass: ExamRepository },
    {
      provide: 'REDIS',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
          password: config.getOrThrow<string>('REDIS_PASSWORD'),
        });
      },
    },
  ],
})
export class ExamModule {}
