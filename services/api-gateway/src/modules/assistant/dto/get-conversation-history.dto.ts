import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetConversationHistoryQueryDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of the question this conversation relates to',
    example: 'b3f1c2a0-1234-4a5b-8c9d-abcdef123456',
  })
  questionId!: string;
}

export class GetConversationHistoryParamsDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of the conversation',
    example: 'b3f1c2a0-1234-4a5b-8c9d-abcdef123456',
  })
  conversationId!: string;
}

export class ChatMessageDTO {
  @ApiProperty({
    description: 'Message id',
    example: 'a1b2c3d4-1234-4a5b-8c9d-abcdef123456',
  })
  id!: string;

  @ApiProperty({
    description: 'Role of the message author',
    example: 'user',
    enum: ['user', 'assistant'],
  })
  role!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Can you give me a hint?',
  })
  content!: string;

  @ApiProperty({
    description: 'Creation timestamp (ISO 8601)',
    example: '2026-07-10T12:34:56.000Z',
  })
  createdAt!: string;
}

export class GetConversationHistoryResponseDTO {
  @ApiProperty({
    description: 'Messages in the conversation, ordered chronologically',
    type: [ChatMessageDTO],
  })
  messages!: ChatMessageDTO[];
}
