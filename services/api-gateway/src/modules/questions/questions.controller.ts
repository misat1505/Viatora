import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ContentServiceClient } from 'src/generated/content';
import { QUESTIONS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { ExamQuestionDTO } from '../exams/dto/start-exam.dto';
import { firstValueFrom } from 'rxjs';

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController implements OnModuleInit {
  private questionsService!: ContentServiceClient;

  constructor(
    @Inject(QUESTIONS_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.questionsService =
      this.grpcClient.getService<ContentServiceClient>('ContentService');
  }

  @Get('/:slug')
  @ApiOkResponse({ type: ExamQuestionDTO })
  async getQuestionBySlug(
    @Param('slug') slug: string,
  ): Promise<ExamQuestionDTO> {
    const result = await firstValueFrom(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.questionsService.getQuestionBySlug(
        { slug },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    // @ts-expect-error TODO: make this error go away
    return result;
  }
}
