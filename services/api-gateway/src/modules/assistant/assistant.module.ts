import { Module } from '@nestjs/common';
import { GrpcClientsModule } from 'src/grpc/clients.module';
import { AssistantController } from './assistant.controller';

@Module({ imports: [GrpcClientsModule], controllers: [AssistantController] })
export class AssistantModule {}
