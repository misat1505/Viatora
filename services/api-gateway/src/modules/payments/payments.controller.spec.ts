import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PAYMENTS_GRPC_CLIENT } from './payments.tokens';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserProfile } from 'src/generated/auth';
import { GetUserSubscriptionsResponse } from 'src/generated/payment';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockGrpcClient = {
    service: {
      createCheckout: vi.fn(),
      handleStripeWebhook: vi.fn(),
      getAllAvailablePlans: vi.fn(),
      getUserSubscriptions: vi.fn(),
    },
  };

  const mockCacheManager = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        PaymentsService,
        {
          provide: PAYMENTS_GRPC_CLIENT,
          useValue: mockGrpcClient,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: GrpcMetadataService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCheckout', () => {
    it('should create checkout', async () => {
      const dto = { category: 'B', months: 3 };

      const user = {
        userId: 'user-123',
        email: 'test@test.com',
      } as UserProfile;

      mockGrpcClient.service.createCheckout.mockResolvedValue({
        checkoutUrl: 'https://checkout.url',
        sessionId: 'session-123',
      });

      const result = await controller.createCheckout(dto, user);

      expect(mockGrpcClient.service.createCheckout).toHaveBeenCalledWith({
        userId: 'user-123',
        userEmail: 'test@test.com',
        ...dto,
      });

      expect(result).toEqual({
        checkoutUrl: 'https://checkout.url',
        sessionId: 'session-123',
      });
    });

    it('should throw grpc error', async () => {
      mockGrpcClient.service.createCheckout.mockRejectedValue(
        new Error('checkout failed'),
      );

      await expect(
        controller.createCheckout({ category: 'B', months: 3 }, {
          userId: 'user-123',
          email: 'test@test.com',
        } as UserProfile),
      ).rejects.toThrow('checkout failed');
    });
  });

  describe('stripeWebhook', () => {
    it('should handle stripe webhook', async () => {
      const rawBody = Buffer.from('payload');

      mockGrpcClient.service.handleStripeWebhook.mockResolvedValue({
        received: true,
      });

      const result = await controller.stripeWebhook(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          rawBody,
        } as any,
        'signature',
      );

      expect(mockGrpcClient.service.handleStripeWebhook).toHaveBeenCalledWith({
        payload: rawBody,
        stripeSignature: 'signature',
      });

      expect(result).toEqual({
        received: true,
      });
    });

    it('should throw webhook error', async () => {
      mockGrpcClient.service.handleStripeWebhook.mockRejectedValue(
        new Error('invalid signature'),
      );

      await expect(
        controller.stripeWebhook(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            rawBody: Buffer.from('payload'),
          } as any,
          'signature',
        ),
      ).rejects.toThrow('invalid signature');
    });
  });

  describe('getAllAvailablePlans', () => {
    it('should return plans', async () => {
      mockGrpcClient.service.getAllAvailablePlans.mockResolvedValue({
        plans: [
          {
            id: 'plan-1',
            name: 'Premium',
            price: 10,
            currency: 'USD',
          },
        ],
      });

      const result = await controller.getAllAvailablePlans();

      expect(mockGrpcClient.service.getAllAvailablePlans).toHaveBeenCalledWith(
        {},
      );

      expect(result.plans[0].id).toBe('plan-1');
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return subscriptions', async () => {
      const returnValue: GetUserSubscriptionsResponse = {
        subscriptions: [
          {
            id: 1,
            category: {
              id: 1,
              category: 'B',
              currency: 'PLN',
              price1Month: 1,
              price3Months: 1,
              price6Months: 1,
            },
            expiresAt: new Date().toISOString(),
            startsAt: new Date().toISOString(),
            userId: '123',
          },
        ],
      };

      mockGrpcClient.service.getUserSubscriptions.mockResolvedValue(
        returnValue,
      );

      const result = await controller.getUserSubscriptions({
        userId: 'user-123',
      } as UserProfile);

      expect(mockGrpcClient.service.getUserSubscriptions).toHaveBeenCalledWith({
        userId: 'user-123',
      });

      expect(result.subscriptions[0].id).toBe(1);
    });
  });
});
