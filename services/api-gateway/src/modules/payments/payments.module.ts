import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { GrpcClientsModule } from 'src/grpc/clients.module';

@Module({ imports: [GrpcClientsModule], controllers: [PaymentsController] })
export class PaymentsModule {}
