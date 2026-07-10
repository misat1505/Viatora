import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConversationRepository } from './conversation.repository';
import { Conversation } from './entities/conversation.entity';

import { getRepositoryToken } from '@nestjs/typeorm';

describe('ConversationRepository', () => {
  let repository: ConversationRepository;

  const typeOrmRepositoryMock = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConversationRepository,
        {
          provide: getRepositoryToken(Conversation),
          useValue: typeOrmRepositoryMock,
        },
      ],
    }).compile();

    repository = moduleRef.get(ConversationRepository);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find conversation by id', async () => {
      const conversation = {
        id: 'conversation-1',
      };

      typeOrmRepositoryMock.findOne.mockResolvedValue(conversation);

      const result = await repository.findById('conversation-1');

      expect(typeOrmRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 'conversation-1',
        },
      });

      expect(result).toEqual(conversation);
    });

    it('should return null when conversation does not exist', async () => {
      typeOrmRepositoryMock.findOne.mockResolvedValue(null);

      const result = await repository.findById('missing-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserAndQuestion', () => {
    it('should find conversation by userId and questionId', async () => {
      const conversation = {
        id: 'conversation-1',
        userId: 'user-1',
        questionId: 'question-1',
      };

      typeOrmRepositoryMock.findOne.mockResolvedValue(conversation);

      const result = await repository.findByUserAndQuestion(
        'user-1',
        'question-1',
      );

      expect(typeOrmRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          questionId: 'question-1',
        },
      });

      expect(result).toEqual(conversation);
    });
  });

  describe('create', () => {
    it('should create and save conversation', async () => {
      const data = {
        userId: 'user-1',
        questionId: 'question-1',
        questionContent: 'Question',
        questionOptions: ['A', 'B'],
        correctAnswer: 'A',
      };

      const entity = {
        id: 'conversation-1',
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
