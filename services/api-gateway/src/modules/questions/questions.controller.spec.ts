import { Test } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { QUESTIONS_PACKAGE } from 'src/grpc/clients.module';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('QuestionsController', () => {
  let controller: QuestionsController;

  const grpcClientMock = {
    getService: vi.fn(),
  };

  const questionsServiceMock = {
    getQuestionBySlug: vi.fn(),
    getQuestionsByFilters: vi.fn(),
  };

  const grpcMetadataServiceMock = {
    authMeta: { metadata: 'mock' },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    grpcClientMock.getService.mockReturnValue(questionsServiceMock);

    const moduleRef = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        { provide: QUESTIONS_PACKAGE, useValue: grpcClientMock },
        { provide: GrpcMetadataService, useValue: grpcMetadataServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(QuestionsController);

    controller.onModuleInit();
  });

  it('should initialize grpc questions service on module init', () => {
    expect(grpcClientMock.getService).toHaveBeenCalledWith('ContentService');
  });

  it('should call gRPC getQuestionBySlug with correct payload', async () => {
    const slug = 'sample-question';

    const grpcResponse = {
      id: 'q1',
      slug: 'sample-question',
      title: 'Sample Question',
      content: 'Question content',
    };

    questionsServiceMock.getQuestionBySlug.mockReturnValue(of(grpcResponse));

    const result = await controller.getQuestionBySlug(slug);

    expect(questionsServiceMock.getQuestionBySlug).toHaveBeenCalledWith(
      { slug },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for getQuestionBySlug', async () => {
    questionsServiceMock.getQuestionBySlug.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      controller.getQuestionBySlug('sample-question'),
    ).rejects.toThrow('grpc failed');
  });

  it('should call gRPC getQuestionsByFilters with correct payload', async () => {
    const body = {
      limit: 10,
      offset: 0,
    } as any;

    const grpcResponse = {
      questions: [
        {
          id: 'q1',
          slug: 'question-1',
        },
        {
          id: 'q2',
          slug: 'question-2',
        },
      ],
    };

    questionsServiceMock.getQuestionsByFilters.mockReturnValue(
      of(grpcResponse),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await controller.getQuestions(body);

    expect(questionsServiceMock.getQuestionsByFilters).toHaveBeenCalledWith(
      body,
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse.questions);
  });

  it('should propagate gRPC error for getQuestions', async () => {
    questionsServiceMock.getQuestionsByFilters.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      controller.getQuestions({
        limit: 10,
        page: 0,
      } as any),
    ).rejects.toThrow('grpc failed');
  });
});
