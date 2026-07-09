import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class PlanDTO {
  @IsInt()
  @ApiProperty({
    description: 'Unique plan identifier',
    example: 1,
  })
  id!: number;

  @IsString()
  @ApiProperty({
    description: 'Plan category name',
    example: 'Premium',
  })
  category!: string;

  @IsInt()
  @ApiProperty({
    description: 'Price for 1 month',
    example: 499,
  })
  price1Month!: number;

  @IsInt()
  @ApiProperty({
    description: 'Price for 3 months',
    example: 999,
  })
  price3Months!: number;

  @IsInt()
  @ApiProperty({
    description: 'Price for 6 months',
    example: 1499,
  })
  price6Months!: number;

  @IsString()
  @ApiProperty({
    description: 'Currency code',
    example: 'PLN',
  })
  currency!: string;
}

export class GetAllAvailablePlansDTO {
  @ApiProperty({
    description: 'List of available plans',
    type: [PlanDTO],
  })
  plans!: PlanDTO[];
}
