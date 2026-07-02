import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StartExamDTO {
  @IsString()
  @ApiProperty({
    description: 'Category of the test',
    example: 'B',
  })
  category!: string; // "B" | "A" | "A1" | "A2" | "B1" | "C" | "D" | "AM"
}

// ── Media ────────────────────────────────────────────────────────

export class MediaDTO {
  @IsIn(['image', 'video', 'none'])
  @ApiProperty({
    description: 'Media type',
    example: 'none',
    enum: ['image', 'video', 'none'],
  })
  type!: string;

  @IsString()
  @ApiProperty({
    description: 'Media URL',
    example: 'https://cdn.viatora.pl/media/abc123.jpg',
  })
  url!: string;
}

// ── Locale ───────────────────────────────────────────────────────

export class LocaleDTO {
  @IsString()
  @ApiProperty({
    description: 'Polish text',
    example: 'Czy wolno wyprzedzać na przejściu dla pieszych?',
  })
  pl!: string;

  @IsString()
  @ApiProperty({
    description: 'English text',
    example: 'Is overtaking allowed on a pedestrian crossing?',
  })
  en!: string;
}

// ── Answers ──────────────────────────────────────────────────────

export class AnswersDTO {
  @ValidateNested()
  @Type(() => LocaleDTO)
  @ApiProperty({
    description: 'Answer option A',
    type: LocaleDTO,
  })
  a!: LocaleDTO;

  @ValidateNested()
  @Type(() => LocaleDTO)
  @ApiProperty({
    description: 'Answer option B',
    type: LocaleDTO,
  })
  b!: LocaleDTO;

  @ValidateNested()
  @Type(() => LocaleDTO)
  @ApiProperty({
    description: 'Answer option C',
    type: LocaleDTO,
  })
  c!: LocaleDTO;

  @IsString()
  @ApiProperty({
    description: 'Correct answer key',
    example: 'a',
  })
  correctAnswer!: string;
}

// ── ExamQuestion ─────────────────────────────────────────────────

export class ExamQuestionDTO {
  @IsString()
  @ApiProperty({
    description: 'Sanity document _id',
    example: 'question-123',
  })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'Slug of the question',
    example: 'czy-wolno-wyprzedzac-na-przejsciu',
  })
  slug!: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Categories this question belongs to',
    example: ['B', 'B1'],
    type: [String],
  })
  categories!: string[];

  @IsIn(['basic', 'specialist'])
  @ApiProperty({
    description: 'Question type',
    example: 'basic',
    enum: ['basic', 'specialist'],
  })
  questionType!: string;

  @ValidateNested()
  @Type(() => LocaleDTO)
  @ApiProperty({
    description: 'Question text',
    type: LocaleDTO,
  })
  text!: LocaleDTO;

  @ValidateNested()
  @Type(() => AnswersDTO)
  @ApiProperty({
    description: 'Answer options and correct answer',
    type: AnswersDTO,
  })
  answers!: AnswersDTO;

  @IsInt()
  @Min(1)
  @Max(3)
  @ApiProperty({
    description: 'Points awarded for this question',
    example: 1,
  })
  points!: number;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Tags associated with the question',
    example: ['road-signs', 'right-of-way'],
    type: [String],
  })
  tags!: string[];

  @ValidateNested()
  @Type(() => MediaDTO)
  @ApiProperty({
    description: 'Media attached to the question',
    type: MediaDTO,
  })
  media!: MediaDTO;
}

export class ExamQuestionWithAnswerDTO {
  @ValidateNested()
  @Type(() => ExamQuestionDTO)
  @ApiProperty({
    description: 'Question data',
    type: ExamQuestionDTO,
  })
  question!: ExamQuestionDTO;

  @IsString()
  @ApiProperty({
    description: 'User selected answer (nullable - not answered yet)',
    example: 'a',
  })
  userAnswer!: string;
}

// ── StartSessionResponse ─────────────────────────────────────────

export class ExamSessionDTO {
  @IsString()
  @ApiProperty({
    description: 'Session identifier',
    example: 'sess_9f8a7b6c',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: 'e57a4daf-8079-4946-9076-a407f5c4b023',
  })
  userId!: string;

  @IsInt()
  @ApiProperty({
    description: 'Time limit for the session in seconds (always 1500)',
    example: 1500,
  })
  timeLimitSeconds!: number;

  @IsInt()
  @ApiProperty({
    description: 'Total number of questions (always 32)',
    example: 32,
  })
  totalQuestions!: number;

  @IsString()
  @ApiProperty({
    description: 'Session start timestamp (ISO 8601)',
    example: '2026-07-01T12:00:00.000Z',
  })
  startedAt!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionWithAnswerDTO)
  @ApiProperty({
    description: 'All questions with user answers',
    type: [ExamQuestionWithAnswerDTO],
  })
  questions!: ExamQuestionWithAnswerDTO[];
}
