import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { GrpcClientsModule, QUESTIONS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { QUESTIONS_GRPC_CLIENT } from './questions.tokens';
import { createGrpcClientProvider } from 'src/grpc/utils/create-grpc-client-provider';
import { ContentServiceClient } from 'src/generated/content';
import { QuestionsService } from './questions.service';

@Module({
  imports: [GrpcClientsModule],
  controllers: [QuestionsController],
  providers: [
    GrpcMetadataService,
    QuestionsService,
    {
      provide: QUESTIONS_GRPC_CLIENT,
      useClass: createGrpcClientProvider<ContentServiceClient>(
        QUESTIONS_PACKAGE,
        'ContentService',
      ),
    },
  ],
})
export class QuestionsModule {}
