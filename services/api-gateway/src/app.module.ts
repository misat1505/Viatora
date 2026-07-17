import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ExamsModule } from './modules/exams/exams.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { StatsModule } from './modules/stats/stats.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from './common/guards/throttler.guard';
import Redis from 'ioredis';
import { REDIS_TOKEN } from './common/tokens';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [
          new KeyvRedis(
            `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
          ),
        ],
        ttl: 5 * 60 * 1000, // 5 min
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ExamsModule,
    QuestionsModule,
    PaymentsModule,
    AssistantModule,
    StatsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    {
      provide: REDIS_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
          password: config.getOrThrow<string>('REDIS_PASSWORD'),
          lazyConnect: true,
        });
      },
    },
  ],
})
export class AppModule {}
