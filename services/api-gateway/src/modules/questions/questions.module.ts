import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { GrpcClientsModule } from 'src/grpc/clients.module';

@Module({ imports: [GrpcClientsModule], controllers: [QuestionsController] })
export class QuestionsModule {}
