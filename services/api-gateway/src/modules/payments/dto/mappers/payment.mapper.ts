// dto/mapper/payments.mapper.ts
import { PaymentServiceClient } from 'src/generated/payment';
import { GrpcResponse } from 'src/grpc/types/grpc-client';
import { CreateCheckoutResponseDTO } from '../create-checkout.dto';
import { GetAllAvailablePlansDTO, PlanDTO } from '../plan.dto';
import {
  GetUserSubscriptionsDTO,
  SubscriptionDTO,
} from '../get-user-subscriptions.dto';

type CreateCheckoutResponse = GrpcResponse<
  PaymentServiceClient,
  'createCheckout'
>;
type GetAllAvailablePlansResponse = GrpcResponse<
  PaymentServiceClient,
  'getAllAvailablePlans'
>;
type GetUserSubscriptionsResponse = GrpcResponse<
  PaymentServiceClient,
  'getUserSubscriptions'
>;

type GrpcPlan = GetAllAvailablePlansResponse['plans'][number];
type GrpcSubscription = GetUserSubscriptionsResponse['subscriptions'][number];

export class PaymentsMapper {
  static toCreateCheckoutResponseDTO(
    result: CreateCheckoutResponse,
  ): CreateCheckoutResponseDTO {
    return {
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    };
  }

  static toPlanDTO(plan: GrpcPlan): PlanDTO {
    return {
      id: plan.id,
      category: plan.category,
      price1Month: plan.price1Month,
      price3Months: plan.price3Months,
      price6Months: plan.price6Months,
      currency: plan.currency,
    };
  }

  static toGetAllAvailablePlansDTO(
    result: GetAllAvailablePlansResponse,
  ): GetAllAvailablePlansDTO {
    return {
      plans: result.plans.map((p) => this.toPlanDTO(p)),
    };
  }

  static toSubscriptionDTO(sub: GrpcSubscription): SubscriptionDTO {
    return {
      id: sub.id,
      userId: sub.userId,
      category: this.toPlanDTO(sub.category!),
      startsAt: sub.startsAt,
      expiresAt: sub.expiresAt,
    };
  }

  static toGetUserSubscriptionsDTO(
    result: GetUserSubscriptionsResponse,
  ): GetUserSubscriptionsDTO {
    return {
      subscriptions: result.subscriptions.map((s) => this.toSubscriptionDTO(s)),
    };
  }
}
