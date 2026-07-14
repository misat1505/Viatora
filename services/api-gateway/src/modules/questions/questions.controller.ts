import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ContentServiceClient } from 'src/generated/content';
import { QUESTIONS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
import { DetailedExamQuestionDTO } from './dto/detailed-question.dto';
import { GetQuestionsQueryDto } from './dto/get-questions.dto';

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
  @ApiOkResponse({ type: DetailedExamQuestionDTO })
  async getQuestionBySlug(
    @Param('slug') slug: string,
  ): Promise<DetailedExamQuestionDTO> {
    const result = await firstValueFrom(
      this.questionsService.getQuestionBySlug(
        { slug },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    // @ts-expect-error TODO: make this error go away
    return result;
  }

  @Post()
  @ApiOkResponse({
    type: DetailedExamQuestionDTO,
    isArray: true,
  })
  async getQuestions(
    @Body() body: GetQuestionsQueryDto,
  ): Promise<DetailedExamQuestionDTO[]> {
    console.log(body);
    return [];

    // const result = await firstValueFrom(
    //   this.questionsService.getQuestions(
    //     query,
    //     // @ts-expect-error metadata not generated
    //     this.grpcMetadataService.authMeta,
    //   ),
    // );

    // // @ts-expect-error
    // return result.questions;
  }
}
