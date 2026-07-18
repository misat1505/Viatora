import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { GrpcClientsModule, PAYMENTS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { PAYMENTS_GRPC_CLIENT } from './payments.tokens';
import { createGrpcClientProvider } from 'src/grpc/utils/create-grpc-client-provider';
import { PaymentServiceClient } from 'src/generated/payment';
import { PaymentsService } from './payments.service';

@Module({
  imports: [GrpcClientsModule],
  controllers: [PaymentsController],
  providers: [
    GrpcMetadataService,
    PaymentsService,
    {
      provide: PAYMENTS_GRPC_CLIENT,
      useClass: createGrpcClientProvider<PaymentServiceClient>(
        PAYMENTS_PACKAGE,
        'PaymentService',
      ),
    },
  ],
})
export class PaymentsModule {}
