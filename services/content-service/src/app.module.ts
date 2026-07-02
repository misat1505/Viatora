import { Module } from '@nestjs/common';
import { QuestionsBankModule } from './modules/questions-bank/questions-bank.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QuestionsBankModule],
})
export class AppModule {}
