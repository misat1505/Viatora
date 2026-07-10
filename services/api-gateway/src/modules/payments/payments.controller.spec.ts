import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import { PaymentsController } from './payments.controller';
import { PAYMENTS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { UserProfile } from 'src/generated/auth';
import { CreateCheckoutDTO } from './dto/create-checkout.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    createCheckout: vi.fn(),
    handleStripeWebhook: vi.fn(),
    getAllAvailablePlans: vi.fn(),
    getUserSubscriptions: vi.fn(),
  };

  const mockGrpcClient = {
    getService: vi.fn().mockReturnValue(mockPaymentsService),
  };

  const mockGrpcMetadataService = {
    authMeta: {
      authorization: 'Bearer token',
    },
  };

  beforeEach(async () => {
    mockGrpcClient.getService.mockReturnValue(mockPaymentsService);

    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PAYMENTS_PACKAGE,
          useValue: mockGrpcClient,
        },
        {
          provide: GrpcMetadataService,
          useValue: mockGrpcMetadataService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(PaymentsController);

    controller.onModuleInit();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCheckout', () => {
    it('should create checkout with user data and dto', async () => {
      const dto = {
        planId: 'plan-123',
      };

      const user = {
        userId: 'user-123',
        email: 'test@test.com',
      };

      const grpcResponse = {
        checkoutUrl: 'https://checkout.url',
      };

      mockPaymentsService.createCheckout.mockReturnValue(of(grpcResponse));

      const result = await controller.createCheckout(
        dto as unknown as CreateCheckoutDTO,
        user as UserProfile,
      );

      expect(mockPaymentsService.createCheckout).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          userEmail: 'test@test.com',
          planId: 'plan-123',
        },
        mockGrpcMetadataService.authMeta,
      );

      expect(result).toEqual(grpcResponse);
    });

    it('should throw grpc error', async () => {
      const error = new Error('checkout failed');

      mockPaymentsService.createCheckout.mockReturnValue(
        throwError(() => error),
      );

      await expect(
        controller.createCheckout(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            planId: 'plan-123',
          } as any,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            userId: 'user-123',
            email: 'test@test.com',
          } as any,
        ),
      ).rejects.toThrow('checkout failed');
    });
  });

  describe('stripeWebhook', () => {
    it('should handle stripe webhook', async () => {
      const rawBody = Buffer.from('stripe payload');

      const req = {
        rawBody,
      };

      const signature = 'stripe-signature';

      const grpcResponse = {
        received: true,
      };

      mockPaymentsService.handleStripeWebhook.mockReturnValue(of(grpcResponse));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.stripeWebhook(req as any, signature);

      expect(mockPaymentsService.handleStripeWebhook).toHaveBeenCalledWith(
        {
          payload: rawBody,
          stripeSignature: signature,
        },
        mockGrpcMetadataService.authMeta,
      );

      expect(result).toEqual(grpcResponse);
    });

    it('should throw error when webhook handling fails', async () => {
      const error = new Error('invalid signature');

      mockPaymentsService.handleStripeWebhook.mockReturnValue(
        throwError(() => error),
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
    it('should return available plans', async () => {
      const grpcResponse = {
        plans: [
          {
            id: 'plan-1',
            name: 'Premium',
          },
        ],
      };

      mockPaymentsService.getAllAvailablePlans.mockReturnValue(
        of(grpcResponse),
      );

      const result = await controller.getAllAvailablePlans();

      expect(mockPaymentsService.getAllAvailablePlans).toHaveBeenCalledWith(
        {},
        mockGrpcMetadataService.authMeta,
      );

      expect(result).toEqual(grpcResponse);
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return user subscriptions', async () => {
      const user = {
        userId: 'user-123',
      };

      const grpcResponse = {
        subscriptions: [
          {
            id: 'subscription-1',
          },
        ],
      };

      mockPaymentsService.getUserSubscriptions.mockReturnValue(
        of(grpcResponse),
      );

      const result = await controller.getUserSubscriptions(user as UserProfile);

      expect(mockPaymentsService.getUserSubscriptions).toHaveBeenCalledWith(
        {
          userId: 'user-123',
        },
        mockGrpcMetadataService.authMeta,
      );

      expect(result).toEqual(grpcResponse);
    });
  });
});
