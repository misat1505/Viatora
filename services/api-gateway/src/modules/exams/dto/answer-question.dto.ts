import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, Min } from 'class-validator';

export class AnswerQuestionDTO {
  @IsString()
  @ApiProperty({
    description: 'The id of the answered question',
    example: '7a93981c-3a4a-4712-885c-ff050d63bed7',
  })
  questionId!: string;

  @IsString()
  @ApiProperty({
    description: 'User selected answer (nullable - not answered yet)',
    example: 'a',
  })
  userAnswer!: string;
}

export class AnswerQuestionResponseDTO {
  @IsBoolean()
  @ApiProperty({
    description:
      'Whether the answer was accepted (session active and not already answered)',
    example: true,
  })
  accepted!: boolean;

  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'Number of answered questions in the session',
    example: 5,
  })
  answeredCount!: number;

  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'Total number of questions in the session',
    example: 32,
  })
  totalQuestions!: number;

  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'Remaining time in seconds',
    example: 1240,
  })
  secondsRemaining!: number;
}
