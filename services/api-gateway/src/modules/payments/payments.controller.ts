import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { PaymentsService } from './payments.service';

@Controller('/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CreateCheckoutResponseDTO })
  createCheckout(
    @Body() dto: CreateCheckoutDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<CreateCheckoutResponseDTO> {
    return this.paymentsService.createCheckout(user, dto);
  }

  @Post('/stripe/webhook')
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.stripeWebhook(req.rawBody!, signature);
  }

  @Get('/plans')
  @UseInterceptors(CacheInterceptor)
  @CacheKey(buildCacheKey('payments', 'plans'))
  @ApiOkResponse({ type: GetAllAvailablePlansDTO })
  getAllAvailablePlans(): Promise<GetAllAvailablePlansDTO> {
    return this.paymentsService.getAllAvailablePlans();
  }

  @Get('/subscriptions/mine')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetUserSubscriptionsDTO })
  getUserSubscriptions(
    @CurrentUser() user: UserProfile,
  ): Promise<GetUserSubscriptionsDTO> {
    return this.paymentsService.getUserSubscriptions(user.userId);
  }
}
