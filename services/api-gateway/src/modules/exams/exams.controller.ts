import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExamSessionDTO, StartExamDTO } from './dto/start-exam.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExamServiceClient } from 'src/generated/exam';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  AnswerQuestionDTO,
  AnswerQuestionResponseDTO,
} from './dto/answer-question.dto';
import { SubmitExamResponseDTO } from './dto/submit-exam.dto';
import { GetExamsResultsResponseDTO } from './dto/get-exams-results.dto';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { ExamsMapper } from './dto/mapper/exams.mapper';
import { EXAM_GRPC_CLIENT } from './exams.tokens';

@Controller('/exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(
    @Inject(EXAM_GRPC_CLIENT)
    private readonly examClient: GrpcClientWrapper<ExamServiceClient>,
  ) {}

  @Post('/start')
  @ApiOkResponse({ type: ExamSessionDTO })
  async startExamSession(
    @Body() dto: StartExamDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<ExamSessionDTO> {
    const examSession = await this.examClient.service.startSession({
      category: dto.category,
      userId: user.userId,
    });

    return ExamsMapper.toExamSessionDTO(examSession);
  }

  @Get('/sessions/:id')
  @ApiOkResponse({ type: ExamSessionDTO })
  async getExamSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ExamSessionDTO> {
    const examSession = await this.examClient.service.getSession({
      sessionId,
      userId: user.userId,
    });

    return ExamsMapper.toExamSessionDTO(examSession);
  }

  @Post('/sessions/:id/answer')
  @ApiOkResponse({ type: AnswerQuestionResponseDTO })
  async answerQuestion(
    @Param('id') sessionId: string,
    @Body() dto: AnswerQuestionDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<AnswerQuestionResponseDTO> {
    const result = await this.examClient.service.submitAnswer({
      sessionId,
      questionId: dto.questionId,
      selectedOption: dto.userAnswer,
      userId: user.userId,
    });

    return ExamsMapper.toAnswerQuestionResponseDTO(result);
  }

  @Post('/sessions/:id/submit')
  @ApiOkResponse({ type: SubmitExamResponseDTO })
  async finishSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SubmitExamResponseDTO> {
    const result = await this.examClient.service.finishSession({
      sessionId,
      userId: user.userId,
    });

    return ExamsMapper.toSubmitExamResponseDTO(result);
  }

  @Get('/exams/results/:id')
  @ApiOkResponse({ type: SubmitExamResponseDTO })
  async getExamResult(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SubmitExamResponseDTO> {
    const result = await this.examClient.service.getResult({
      sessionId,
      userId: user.userId,
    });

    return ExamsMapper.toSubmitExamResponseDTO(result);
  }

  @Get('/exams/results')
  @ApiOkResponse({ type: GetExamsResultsResponseDTO })
  async getExamsResults(
    @CurrentUser() user: UserProfile,
  ): Promise<GetExamsResultsResponseDTO> {
    const result = await this.examClient.service.listResults({
      userId: user.userId,
    });

    return ExamsMapper.toGetExamsResultsResponseDTO(result);
  }
}
