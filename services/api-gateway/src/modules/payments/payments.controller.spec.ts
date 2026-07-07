import { Test } from '@nestjs/testing';
import { QuestionsController } from './payments.controller';
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
  };

  const grpcMetadataServiceMock = {
    authMeta: { metadata: 'mock' },
  };

  beforeEach(async () => {
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
    vi.clearAllMocks();
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
});
