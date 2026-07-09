import { ApiProperty } from '@nestjs/swagger';
import { PlanDTO } from './plan.dto';

export class SubscriptionDTO {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: '123',
  })
  userId!: string;

  @ApiProperty({
    type: PlanDTO,
  })
  category!: PlanDTO;

  @ApiProperty({
    example: '2026-07-01',
  })
  startsAt!: string;

  @ApiProperty({
    example: '2026-08-01',
  })
  expiresAt!: string;
}

export class GetUserSubscriptionsDTO {
  @ApiProperty({
    type: [SubscriptionDTO],
  })
  subscriptions!: SubscriptionDTO[];
}
