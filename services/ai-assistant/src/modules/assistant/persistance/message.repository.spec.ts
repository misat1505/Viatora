import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MessageRepository } from './message.repository';
import { Message, MessageRole } from './entities/message.entity';

describe('MessageRepository', () => {
  let repository: MessageRepository;

  const typeOrmRepositoryMock = {
    find: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MessageRepository,
        {
          provide: getRepositoryToken(Message),
          useValue: typeOrmRepositoryMock,
        },
      ],
    }).compile();

    repository = moduleRef.get(MessageRepository);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByConversationId', () => {
    it('should find messages by conversation id ordered by createdAt ascending', async () => {
      const messages = [
        {
          id: 'message-1',
          conversationId: 'conversation-1',
          role: MessageRole.USER,
          content: 'Hello',
        },
        {
          id: 'message-2',
          conversationId: 'conversation-1',
          role: MessageRole.ASSISTANT,
          content: 'Hi',
        },
      ];

      typeOrmRepositoryMock.find.mockResolvedValue(messages);

      const result = await repository.findByConversationId('conversation-1');

      expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-1',
        },
        order: {
          createdAt: 'ASC',
        },
      });

      expect(result).toEqual(messages);
    });

    it('should return empty array when there are no messages', async () => {
      typeOrmRepositoryMock.find.mockResolvedValue([]);

      const result = await repository.findByConversationId('conversation-1');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and save message', async () => {
      const data = {
        conversationId: 'conversation-1',
        role: MessageRole.USER,
        content: 'Hello',
      };

      const entity = {
        id: 'message-1',
        ...data,
      };

      typeOrmRepositoryMock.create.mockReturnValue(entity);

      typeOrmRepositoryMock.save.mockResolvedValue(entity);

      const result = await repository.create(data);

      expect(typeOrmRepositoryMock.create).toHaveBeenCalledWith(data);

      expect(typeOrmRepositoryMock.save).toHaveBeenCalledWith(entity);

      expect(result).toEqual(entity);
    });
  });
});
