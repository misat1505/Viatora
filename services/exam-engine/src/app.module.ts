import { Module } from '@nestjs/common';
import { ExamModule } from './modules/exam/exam.module';

@Module({
  imports: [ExamModule],
})
export class AppModule {}
