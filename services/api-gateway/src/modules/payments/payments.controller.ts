import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  OnModuleInit,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
  UseInterceptors,
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
import {
  CreateCheckoutDTO,
  CreateCheckoutResponseDTO,
} from './dto/create-checkout.dto';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
} from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { buildCacheKey } from 'src/utils/build-cache-key';

@Controller('/payments')
export class PaymentsController implements OnModuleInit {
  private paymentsService!: PaymentServiceClient;

  constructor(
    @Inject(PAYMENTS_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.paymentsService =
      this.grpcClient.getService<PaymentServiceClient>('PaymentService');
  }

  @Post('/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CreateCheckoutResponseDTO })
  async createCheckout(
    @Body() dto: CreateCheckoutDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<CreateCheckoutResponseDTO> {
    const result = await firstValueFrom(
      this.paymentsService.createCheckout(
        { userId: user.userId, userEmail: user.email, ...dto },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }

  @Post('/stripe/webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const result = await firstValueFrom(
      this.paymentsService.handleStripeWebhook(
        { payload: req.rawBody!, stripeSignature: signature },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }

  @Get('/plans')
  @UseInterceptors(CacheInterceptor)
  @CacheKey(buildCacheKey('payments', 'plans'))
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
      this.paymentsService.getUserSubscriptions(
        {
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    // @ts-expect-error make this error go away
    return result;
  }
}
