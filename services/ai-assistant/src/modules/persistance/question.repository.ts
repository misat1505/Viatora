import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ContentServiceClient,
  DetailedExamQuestion,
  GetQuestionByIdRequest,
} from 'src/generated/content';
import { CONTENT_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';

@Injectable()
export class QuestionRepository implements OnModuleInit {
  private questionsService!: ContentServiceClient;

  constructor(
    @Inject(CONTENT_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.questionsService =
      this.grpcClient.getService<ContentServiceClient>('ContentService');
  }

  async getQuestionsById(
    id: GetQuestionByIdRequest['id'],
  ): Promise<DetailedExamQuestion | null> {
    const question = await firstValueFrom(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.questionsService.getQuestionById(
        { id },
        // @ts-expect-error metadata not in generated types
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.grpcMetadataService.authMeta,
      ),
    );

    return question ?? null;
  }
}
