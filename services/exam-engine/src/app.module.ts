import { Module } from '@nestjs/common';
import { ExamModule } from './modules/exam/exam.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ExamModule],
})
export class AppModule {}
