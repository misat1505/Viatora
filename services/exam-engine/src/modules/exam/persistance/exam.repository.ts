import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  GetQuestionsFilters,
  IExamRepository,
} from './exam.repository.interface';
import { type ClientGrpc } from '@nestjs/microservices';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { CONTENT_PACKAGE } from 'src/grpc/clients.module';
import { ContentServiceClient } from 'src/generated/content';
import { firstValueFrom } from 'rxjs';

export const EXAM_REPOSITORY_TOKEN = Symbol('EXAM_REPOSITORY_TOKEN');

@Injectable()
export class ExamRepository implements IExamRepository, OnModuleInit {
  private contentService!: ContentServiceClient;

  constructor(
    @Inject(CONTENT_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.contentService =
      this.grpcClient.getService<ContentServiceClient>('ContentService');
  }

  async getQuestionsByCategory(filters: GetQuestionsFilters) {
    const questions = await firstValueFrom(
      this.contentService.getQuestions(
        {
          category: filters.category,
          count: filters.count,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return questions;
  }
}
