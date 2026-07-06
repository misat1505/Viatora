import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExamSessionDTO, StartExamDTO } from './dto/start-exam.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExamServiceClient } from 'src/generated/exam';
import { type ClientGrpc } from '@nestjs/microservices';
import { EXAMS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  AnswerQuestionDTO,
  AnswerQuestionResponseDTO,
} from './dto/answer-question.dto';
import { SubmitExamResponseDTO } from './dto/submit-exam.dto';

@Controller('/exams')
@UseGuards(JwtAuthGuard)
export class ExamsController implements OnModuleInit {
  private examService!: ExamServiceClient;

  constructor(
    @Inject(EXAMS_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.examService =
      this.grpcClient.getService<ExamServiceClient>('ExamService');
  }

  @Post('/start')
  @ApiOkResponse({ type: ExamSessionDTO })
  async startExamSession(
    @Body() dto: StartExamDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<ExamSessionDTO> {
    const examSession = await firstValueFrom(
      this.examService.startSession(
        {
          category: dto.category,
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    // @ts-expect-error TODO: make this error go away
    return examSession;
  }

  @Get('/sessions/:id')
  @ApiOkResponse({ type: ExamSessionDTO })
  async getExamSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ExamSessionDTO> {
    const examSession = await firstValueFrom(
      this.examService.getSession(
        {
          sessionId,
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    // @ts-expect-error TODO: make this error go away
    return examSession;
  }

  @Post('/sessions/:id/answer')
  @ApiOkResponse({ type: AnswerQuestionResponseDTO })
  async answerQuestion(
    @Param('id') sessionId: string,
    @Body() dto: AnswerQuestionDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<AnswerQuestionResponseDTO> {
    const result = await firstValueFrom(
      this.examService.submitAnswer(
        {
          sessionId,
          questionId: dto.questionId,
          selectedOption: dto.userAnswer,
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }

  @Post('/sessions/:id/submit')
  @ApiOkResponse({ type: SubmitExamResponseDTO })
  async finishSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SubmitExamResponseDTO> {
    const result = await firstValueFrom(
      this.examService.finishSession(
        {
          sessionId,
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }

  @Get('/exams/results/:id')
  @ApiOkResponse({ type: SubmitExamResponseDTO })
  async getExamResult(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SubmitExamResponseDTO> {
    const result = await firstValueFrom(
      this.examService.getResult(
        {
          sessionId,
          userId: user.userId,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }
}
