import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of the question this conversation relates to',
    example: 'b3f1c2a0-1234-4a5b-8c9d-abcdef123456',
  })
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User message content',
    example: 'Can you give me a hint?',
  })
  message!: string;

  @IsIn(['pl', 'en'])
  @ApiProperty({
    description: 'Locale used to fetch question content',
    example: 'pl',
    enum: ['pl', 'en'],
  })
  locale!: 'pl' | 'en';
}

export class SendMessageResponseDTO {
  @ApiProperty({
    description: 'Id of the conversation (existing or newly created)',
    example: 'b3f1c2a0-1234-4a5b-8c9d-abcdef123456',
  })
  conversationId!: string;

  @ApiProperty({
    description: 'AI assistant reply',
    example:
      'Think about which option relates to the traffic rule described...',
  })
  reply!: string;
}
