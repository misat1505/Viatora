import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum ExamSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  TIMED_OUT = 'timed_out',
}

export class AnswerResultDTO {
  @ApiProperty({
    description: 'Answer unique identifier (UUID from DB)',
    example: 'b6dce960-dee8-4c0d-949d-2c97e201a0f0',
    format: 'uuid',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Question identifier from Content Service (NOT UUID)',
    example: 'F9XiJ53WKhENnUVd5CDjCj',
  })
  @IsString()
  questionId!: string;

  @ApiProperty({
    description: 'Question slug',
    example: 'czy-mozna-na-rondzie',
  })
  @IsString()
  questionSlug!: string;

  @ApiProperty({
    description: 'Selected answer option',
    example: 'a',
    enum: ['a', 'b', 'c'],
  })
  @IsString()
  selectedOption!: string;

  @ApiProperty({
    description: 'Correct answer option',
    example: 'b',
    enum: ['a', 'b', 'c'],
  })
  @IsString()
  correctOption!: string;

  @ApiProperty({
    description: 'Whether user answer was correct',
    example: true,
  })
  @IsBoolean()
  isCorrect!: boolean;

  @ApiProperty({
    description: 'Timestamp when answer was submitted',
    example: '2026-07-06T10:04:17.000Z',
    format: 'date-time',
  })
  @IsString()
  answeredAt!: string;
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

  @ApiPropertyOptional({
    description: 'Exam percentage score',
    example: 69,
  })
  @IsNumber()
  scorePercent!: number;

  @ApiPropertyOptional({
    description: 'List of all answers for the exam',
    type: [AnswerResultDTO],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  answers!: AnswerResultDTO[];
}
