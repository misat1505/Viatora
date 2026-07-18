import { Module } from '@nestjs/common';
import { ASSISTANT_PACKAGE, GrpcClientsModule } from 'src/grpc/clients.module';
import { AssistantController } from './assistant.controller';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { AssistantServiceClient } from 'src/generated/assistant';
import { ASSISTANT_GRPC_CLIENT } from './assistant.tokens';
import { createGrpcClientProvider } from 'src/grpc/utils/create-grpc-client-provider';

@Module({
  imports: [GrpcClientsModule],
  controllers: [AssistantController],
  providers: [
    GrpcMetadataService,
    {
      provide: ASSISTANT_GRPC_CLIENT,
      useClass: createGrpcClientProvider<AssistantServiceClient>(
        ASSISTANT_PACKAGE,
        'AssistantService',
      ),
    },
  ],
})
export class AssistantModule {}
