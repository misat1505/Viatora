import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

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
    description: 'Did the answer process succeed (not is the answer correct)',
    example: true,
  })
  ok!: boolean;
}
