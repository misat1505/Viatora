import { Module } from '@nestjs/common';
import { ExamModule } from './modules/exam/exam.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ExamModule],
})
export class AppModule {}
