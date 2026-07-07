import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PAYMENTS_PACKAGE, QUESTIONS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
import { DetailedExamQuestionDTO } from './dto/detailed-question.dto';
import { PaymentServiceClient } from 'src/generated/payment';

@Controller('/payments')
// @UseGuards(JwtAuthGuard)
export class PaymentsController implements OnModuleInit {
  private paymentsService!: PaymentServiceClient;

  constructor(
    @Inject(PAYMENTS_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.paymentsService =
      this.grpcClient.getService<PaymentServiceClient>('PaymentService');
  }

  @Get('/checkout')
  // @ApiOkResponse({ type: DetailedExamQuestionDTO })
  async createCheckout() {
    const result = await firstValueFrom(
      this.paymentsService.createCheckout(
        { userId: '123', plan: 'ijsaiu' },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }
}
