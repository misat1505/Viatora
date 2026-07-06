import { Module } from '@nestjs/common';
import { ExamModule } from './modules/exam/exam.module';
import { ConfigModule } from '@nestjs/config';
import { ServiceKeyGuard } from './common/guards/service-key.guard';
import { ExamResultsModule } from './modules/exam-results/exam-results.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ExamModule,
    ExamResultsModule,
  ],
  providers: [ServiceKeyGuard],
})
export class AppModule {}
