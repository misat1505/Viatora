import { Module } from '@nestjs/common';
import { ExamModule } from './modules/exam/exam.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceKeyGuard } from './common/guards/service-key.guard';
import { ExamResultsModule } from './modules/exam-results/exam-results.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ExamModule,
    ExamResultsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // TODO: DEV only
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ServiceKeyGuard }],
})
export class AppModule {}
