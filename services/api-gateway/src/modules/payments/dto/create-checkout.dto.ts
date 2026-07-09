import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateCheckoutDTO {
  @IsString()
  @ApiProperty({
    description: 'Subscription category',
    example: 'Premium',
  })
  category!: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Subscription duration in months',
    example: 3,
  })
  months!: number;
}

export class CreateCheckoutResponseDTO {
  @ApiProperty({
    description: 'Stripe checkout URL',
    example: 'https://checkout.stripe.com/c/pay/cs_test_123',
  })
  checkoutUrl!: string;

  @ApiProperty({
    description: 'Stripe checkout session ID',
    example: 'cs_test_a1b2c3',
  })
  sessionId!: string;
}
