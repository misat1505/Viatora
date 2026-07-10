import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Observable, of } from 'rxjs';

import { QuestionRepository } from './question.repository';
import { CONTENT_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';

describe('QuestionRepository', () => {
  let repository: QuestionRepository;

  const questionsServiceMock = {
    getQuestionById: vi.fn(),
  };

  const grpcClientMock = {
    getService: vi.fn(),
  };

  const grpcMetadataServiceMock = {
    authMeta: {
      authorization: 'Bearer token',
    },
  };

  beforeEach(async () => {
    grpcClientMock.getService.mockReturnValue(questionsServiceMock);

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuestionRepository,
        {
          provide: CONTENT_PACKAGE,
          useValue: grpcClientMock,
        },
        {
          provide: GrpcMetadataService,
          useValue: grpcMetadataServiceMock,
        },
      ],
    }).compile();

    repository = moduleRef.get(QuestionRepository);

    repository.onModuleInit();

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getQuestionsById', () => {
    it('should return question from grpc service', async () => {
      const question = {
        id: 'question-1',
        text: 'Question?',
        answers: [],
      };

      questionsServiceMock.getQuestionById.mockReturnValue(of(question));

      const result = await repository.getQuestionsById('question-1');

      expect(questionsServiceMock.getQuestionById).toHaveBeenCalledWith(
        {
          id: 'question-1',
        },
        grpcMetadataServiceMock.authMeta,
      );

      expect(result).toEqual(question);
    });

    it('should return null when grpc returns empty response', async () => {
      questionsServiceMock.getQuestionById.mockReturnValue(of(null));

      const result = await repository.getQuestionsById('question-1');

      expect(result).toBeNull();
    });

    it('should throw error when grpc request fails', async () => {
      questionsServiceMock.getQuestionById.mockReturnValue(
        new Observable((subscriber) => {
          subscriber.error(new Error('grpc error'));
        }),
      );

      await expect(repository.getQuestionsById('question-1')).rejects.toThrow(
        'grpc error',
      );
    });
  });
});
