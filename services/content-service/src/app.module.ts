import { Module } from '@nestjs/common';
import { QuestionsBankModule } from './modules/questions-bank/questions-bank.module';

@Module({
  imports: [QuestionsBankModule],
})
export class AppModule {}
