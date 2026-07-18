import { Test } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { QUESTIONS_GRPC_CLIENT } from './questions.tokens';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;

  const grpcResponse = {
    id: 'q1',
    slug: 'sample-question',
    text: {
      en: 'Sample Question',
      pl: '',
    },
    answers: {
      a: { en: '', pl: '' },
      b: { en: '', pl: '' },
      c: { en: '', pl: '' },
      correctAnswer: '',
    },
    explanation: {
      en: '',
      pl: '',
    },
    categories: [],
    tags: [],
    points: 0,
    questionType: 'basic',
    media: {
      type: 'none',
      url: '',
    },
  };

  const grpcResponseArray = { questions: [grpcResponse] };

  const grpcClientMock = {
    service: {
      getQuestionBySlug: vi.fn(),
      getQuestionsByFilters: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        QuestionsService,
        {
          provide: QUESTIONS_GRPC_CLIENT,
          useValue: grpcClientMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(QuestionsController);
  });

  it('should call gRPC getQuestionBySlug with correct payload', async () => {
    const slug = 'sample-question';

    grpcClientMock.service.getQuestionBySlug.mockResolvedValue(grpcResponse);

    const result = await controller.getQuestionBySlug(slug);

    expect(grpcClientMock.service.getQuestionBySlug).toHaveBeenCalledWith({
      slug,
    });

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for getQuestionBySlug', async () => {
    grpcClientMock.service.getQuestionBySlug.mockRejectedValue(
      new Error('grpc failed'),
    );

    await expect(
      controller.getQuestionBySlug('sample-question'),
    ).rejects.toThrow('grpc failed');
  });

  it('should call gRPC getQuestionsByFilters with correct payload', async () => {
    const body = {
      limit: 10,
      offset: 0,
      page: 1,
    };

    grpcClientMock.service.getQuestionsByFilters.mockResolvedValue(
      grpcResponseArray,
    );

    const result = await controller.getQuestions(body);

    expect(grpcClientMock.service.getQuestionsByFilters).toHaveBeenCalledWith(
      body,
    );

    expect(result).toEqual(grpcResponseArray.questions);
  });

  it('should propagate gRPC error for getQuestions', async () => {
    grpcClientMock.service.getQuestionsByFilters.mockRejectedValue(
      new Error('grpc failed'),
    );

    await expect(
      controller.getQuestions({
        limit: 10,
        page: 0,
      }),
    ).rejects.toThrow('grpc failed');
  });
});
