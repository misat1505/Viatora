import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { PAYMENTS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
import { PaymentServiceClient } from 'src/generated/payment';
import { ApiOkResponse } from '@nestjs/swagger';
import { GetAllAvailablePlansDTO } from './dto/plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { GetUserSubscriptionsDTO } from './dto/get-user-subscriptions.dto';

@Controller('/payments')
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

  @Get('/plans')
  @ApiOkResponse({ type: GetAllAvailablePlansDTO })
  async getAllAvailablePlans(): Promise<GetAllAvailablePlansDTO> {
    const result = await firstValueFrom(
      this.paymentsService.getAllAvailablePlans(
        {},
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }

  @Get('/subscriptions/mine')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetUserSubscriptionsDTO })
  async getUserSubscriptions(
    @CurrentUser() user: UserProfile,
  ): Promise<GetUserSubscriptionsDTO> {
    const result = await firstValueFrom(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.paymentsService.getUserSubscriptions(
        {
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    console.log(result);
    // @ts-expect-error make this error go away
    return result;
  }
}
