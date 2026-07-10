import { Module } from '@nestjs/common';
import { OPENAI_SERVICE, OpenAIService } from './openai.service';

@Module({
  providers: [
    {
      provide: OPENAI_SERVICE,
      useClass: OpenAIService,
    },
  ],
  exports: [OPENAI_SERVICE],
})
export class OpenAIModule {}
