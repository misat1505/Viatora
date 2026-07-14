import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetQuestionsQueryDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 25,
    default: 25,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 25;

  @ApiPropertyOptional({
    type: Number,
    example: 3,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['road-signs', 'right-of-way'],
  })
  @Transform(({ value }) => {
    if (value == null || value === '') {
      return undefined;
    }

    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    }

    return String(value)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    type: String,
    example: 'en',
  })
  @IsString()
  @IsOptional()
  lang?: string;
}
