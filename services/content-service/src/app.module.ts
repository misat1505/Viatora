import { Module } from '@nestjs/common';
import { QuestionsBankModule } from './modules/questions-bank/questions-bank.module';
import { ConfigModule } from '@nestjs/config';
import { ServiceKeyGuard } from './common/guards/service-key.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QuestionsBankModule],
  providers: [ServiceKeyGuard],
})
export class AppModule {}
