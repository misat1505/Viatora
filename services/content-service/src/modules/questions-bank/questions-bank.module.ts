import { Module } from '@nestjs/common';
import { QuestionsBankController } from './questions-bank.controller';
import {
  QUESTIONS_BANK_REPOSITORY_TOKEN,
  QuestionsBankRepository,
} from './persistance/questions-bank.repository';
import { QuestionsBankService } from './questions-bank.service';

@Module({
  controllers: [QuestionsBankController],
  providers: [
    QuestionsBankService,
    {
      provide: QUESTIONS_BANK_REPOSITORY_TOKEN,
      useClass: QuestionsBankRepository,
    },
  ],
})
export class QuestionsBankModule {}
