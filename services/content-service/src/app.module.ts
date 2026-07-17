import { Module } from '@nestjs/common';
import { QuestionsBankModule } from './modules/questions-bank/questions-bank.module';
import { ConfigModule } from '@nestjs/config';
import { ServiceKeyGuard } from './common/guards/service-key.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QuestionsBankModule],
  providers: [{ provide: APP_GUARD, useClass: ServiceKeyGuard }],
})
export class AppModule {}
