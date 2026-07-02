import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';

import { QuestionsRepository } from './questions.repository';
import { CONTENT_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';

describe('QuestionsRepository', () => {
  let repository: QuestionsRepository;

  const grpcClientMock = {
    getService: vi.fn(),
  };

  const grpcServiceMock = {
    getQuestions: vi.fn(),
  };

  const grpcMetadataServiceMock = {
    authMeta: { authorization: 'Bearer token' },
  };

  beforeEach(async () => {
    grpcClientMock.getService.mockReturnValue(grpcServiceMock);

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuestionsRepository,
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

    repository = moduleRef.get(QuestionsRepository);

    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // 1. INIT
  // ─────────────────────────────────────────────
  it('should initialize grpc service on module init', () => {
    repository.onModuleInit();

    expect(grpcClientMock.getService).toHaveBeenCalledWith('ContentService');
  });

  // ─────────────────────────────────────────────
  // 2. HAPPY PATH
  // ─────────────────────────────────────────────
  it('should fetch questions and return questions array', async () => {
    const grpcResponse = {
      questions: [{ id: 'q1' }, { id: 'q2' }],
    };

    grpcServiceMock.getQuestions.mockReturnValue(of(grpcResponse));

    repository.onModuleInit();

    const result = await repository.getQuestionsByCategory({
      category: 'B',
      questionType: 'basic',
      points: 1,
      count: 2,
    });

    expect(grpcServiceMock.getQuestions).toHaveBeenCalledWith(
      {
        category: 'B',
        questionType: 'basic',
        points: 1,
        count: 2,
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse.questions);
  });

  // ─────────────────────────────────────────────
  // 3. CHECK METADATA PASSED
  // ─────────────────────────────────────────────
  it('should pass grpc metadata to request', async () => {
    grpcServiceMock.getQuestions.mockReturnValue(of({ questions: [] }));

    repository.onModuleInit();

    await repository.getQuestionsByCategory({
      category: 'A',
      questionType: 'specialist',
      points: 3,
      count: 1,
    });

    expect(grpcServiceMock.getQuestions).toHaveBeenCalledWith(
      expect.any(Object),
      grpcMetadataServiceMock.authMeta,
    );
  });
});
