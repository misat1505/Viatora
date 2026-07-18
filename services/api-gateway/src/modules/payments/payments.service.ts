import { Inject, Injectable } from '@nestjs/common';
import { PaymentServiceClient } from 'src/generated/payment';
import { GetAllAvailablePlansDTO } from './dto/plan.dto';
import { UserProfile } from 'src/generated/auth';
import { GetUserSubscriptionsDTO } from './dto/get-user-subscriptions.dto';
import {
  CreateCheckoutDTO,
  CreateCheckoutResponseDTO,
} from './dto/create-checkout.dto';
import { PAYMENTS_GRPC_CLIENT } from './payments.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { PaymentsMapper } from './dto/mappers/payment.mapper';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_GRPC_CLIENT)
    private readonly paymentsClient: GrpcClientWrapper<PaymentServiceClient>,
  ) {}

  async createCheckout(
    user: Pick<UserProfile, 'userId' | 'email'>,
    dto: CreateCheckoutDTO,
  ): Promise<CreateCheckoutResponseDTO> {
    const result = await this.paymentsClient.service.createCheckout({
      userId: user.userId,
      userEmail: user.email,
      ...dto,
    });

    return PaymentsMapper.toCreateCheckoutResponseDTO(result);
  }

  stripeWebhook(rawBody: Buffer<ArrayBufferLike>, signature: string) {
    return this.paymentsClient.service.handleStripeWebhook({
      payload: rawBody,
      stripeSignature: signature,
    });
  }

  async getAllAvailablePlans(): Promise<GetAllAvailablePlansDTO> {
    const result = await this.paymentsClient.service.getAllAvailablePlans({});
    return PaymentsMapper.toGetAllAvailablePlansDTO(result);
  }

  async getUserSubscriptions(
    userId: UserProfile['userId'],
  ): Promise<GetUserSubscriptionsDTO> {
    const result = await this.paymentsClient.service.getUserSubscriptions({
      userId,
    });

    return PaymentsMapper.toGetUserSubscriptionsDTO(result);
  }
}
