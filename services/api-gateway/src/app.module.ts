import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ExamsModule } from './modules/exams/exams.module';
import { QuestionsModule } from './modules/questions/questions.module';

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
  ],
})
export class AppModule {}
