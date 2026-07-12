import { Module } from '@nestjs/common';
import { QuestionsBankController } from './questions-bank.controller';
import {
  QUESTIONS_BANK_REPOSITORY_TOKEN,
  QuestionsBankRepository,
} from './persistance/questions-bank.repository';
import { QuestionsBankService } from './questions-bank.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  QUESTIONS_BANK_CACHE_TOKEN,
  QuestionsBankCache,
} from './cache/questions-bank.cache';

@Module({
  controllers: [QuestionsBankController],
  providers: [
    QuestionsBankService,
    {
      provide: QUESTIONS_BANK_REPOSITORY_TOKEN,
      useClass: QuestionsBankRepository,
    },
    {
      provide: QUESTIONS_BANK_CACHE_TOKEN,
      useClass: QuestionsBankCache,
    },
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
export class QuestionsBankModule {}
