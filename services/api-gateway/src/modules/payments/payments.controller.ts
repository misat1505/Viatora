import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { buildCacheKey } from 'src/utils/build-cache-key';
import { PAYMENTS_GRPC_CLIENT } from './payments.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { PaymentsMapper } from './dto/mappers/payment.mapper';

@Controller('/payments')
export class PaymentsController {
  constructor(
    @Inject(PAYMENTS_GRPC_CLIENT)
    private readonly paymentsClient: GrpcClientWrapper<PaymentServiceClient>,
  ) {}

  @Post('/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CreateCheckoutResponseDTO })
  async createCheckout(
    @Body() dto: CreateCheckoutDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<CreateCheckoutResponseDTO> {
    const result = await this.paymentsClient.service.createCheckout({
      userId: user.userId,
      userEmail: user.email,
      ...dto,
    });

    return PaymentsMapper.toCreateCheckoutResponseDTO(result);
  }

  @Post('/stripe/webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsClient.service.handleStripeWebhook({
      payload: req.rawBody!,
      stripeSignature: signature,
    });
  }

  @Get('/plans')
  @UseInterceptors(CacheInterceptor)
  @CacheKey(buildCacheKey('payments', 'plans'))
  @ApiOkResponse({ type: GetAllAvailablePlansDTO })
  async getAllAvailablePlans(): Promise<GetAllAvailablePlansDTO> {
    const result = await this.paymentsClient.service.getAllAvailablePlans({});
    return PaymentsMapper.toGetAllAvailablePlansDTO(result);
  }

  @Get('/subscriptions/mine')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetUserSubscriptionsDTO })
  async getUserSubscriptions(
    @CurrentUser() user: UserProfile,
  ): Promise<GetUserSubscriptionsDTO> {
    const result = await this.paymentsClient.service.getUserSubscriptions({
      userId: user.userId,
    });

    return PaymentsMapper.toGetUserSubscriptionsDTO(result);
  }
}
