import { Module } from '@nestjs/common';
import { ExamModule } from './modules/exam/exam.module';
import { ConfigModule } from '@nestjs/config';
import { ServiceKeyGuard } from './common/guards/service-key.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ExamModule],
  providers: [ServiceKeyGuard],
})
export class AppModule {}
