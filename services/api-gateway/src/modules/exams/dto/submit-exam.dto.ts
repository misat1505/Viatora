import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export enum ExamSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  TIMED_OUT = 'timed_out',
}

export class SubmitExamResponseDTO {
  @ApiProperty({
    description: 'Unique session identifier',
    format: 'uuid',
    example: 'b5b3c3d2-4f18-4dcb-9b4e-f6cb7d34e53d',
  })
  @IsUUID()
  sessionId!: string;

  @ApiProperty({
    description: 'User identifier',
    format: 'uuid',
    example: '2efbcb6a-7db7-4946-a40d-8b8f6eb5d6e7',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    enum: ExamSessionStatus,
    example: ExamSessionStatus.IN_PROGRESS,
  })
  @IsString()
  status!: string;

  @ApiProperty({
    description: 'Driving license category',
    example: 'B',
    maxLength: 8,
  })
  @IsString()
  @Length(1, 8)
  category!: string;

  @ApiProperty({
    description: 'Total number of questions',
    example: 32,
    minimum: 1,
    maximum: 32,
  })
  @IsInt()
  @Min(1)
  @Max(32)
  totalQuestions!: number;

  @ApiPropertyOptional({
    description: 'Number of correct answers',
    example: 30,
    minimum: 0,
    maximum: 32,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(32)
  correctAnswers!: number;

  @ApiPropertyOptional({
    description: 'Points earned',
    example: 70,
    minimum: 0,
    maximum: 74,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(74)
  earnedPoints!: number;

  @ApiPropertyOptional({
    description: 'Maximum obtainable points',
    example: 74,
    minimum: 0,
    maximum: 74,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(74)
  maxPoints!: number;

  @ApiPropertyOptional({
    description: 'Whether the exam was passed',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  passed!: boolean;

  @ApiProperty({
    description: 'Time limit in seconds',
    example: 1500,
  })
  @IsInt()
  @Min(1)
  timeLimitSeconds!: number;

  @ApiProperty({
    description: 'Session start date',
    example: '2026-07-06T08:45:00.000Z',
  })
  @Type(() => Date)
  @IsString()
  startedAt!: string;

  @ApiPropertyOptional({
    description: 'Session completion date',
    example: '2026-07-06T09:05:00.000Z',
  })
  @IsString()
  completedAt!: string;
}
