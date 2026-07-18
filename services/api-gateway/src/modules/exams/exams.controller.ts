import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ExamSessionDTO, StartExamDTO } from './dto/start-exam.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  AnswerQuestionDTO,
  AnswerQuestionResponseDTO,
} from './dto/answer-question.dto';
import { SubmitExamResponseDTO } from './dto/submit-exam.dto';
import { GetExamsResultsResponseDTO } from './dto/get-exams-results.dto';
import { ExamsService } from './exams.service';

@Controller('/exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('/start')
  @ApiOkResponse({ type: ExamSessionDTO })
  startExamSession(
    @Body() dto: StartExamDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<ExamSessionDTO> {
    return this.examsService.startExamSession(user.userId, {
      category: dto.category,
    });
  }

  @Get('/sessions/:id')
  @ApiOkResponse({ type: ExamSessionDTO })
  getExamSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ExamSessionDTO> {
    return this.examsService.getExamSession(user.userId, sessionId);
  }

  @Post('/sessions/:id/answer')
  @ApiOkResponse({ type: AnswerQuestionResponseDTO })
  answerQuestion(
    @Param('id') sessionId: string,
    @Body() dto: AnswerQuestionDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<AnswerQuestionResponseDTO> {
    return this.examsService.answerQuestion(user.userId, sessionId, dto);
  }

  @Post('/sessions/:id/submit')
  @ApiOkResponse({ type: SubmitExamResponseDTO })
  finishSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SubmitExamResponseDTO> {
    return this.examsService.finishSession(user.userId, sessionId);
  }

  @Get('/exams/results/:id')
  @ApiOkResponse({ type: SubmitExamResponseDTO })
  getExamResult(
    @Param('id') sessionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SubmitExamResponseDTO> {
    return this.examsService.getExamResult(user.userId, sessionId);
  }

  @Get('/exams/results')
  @ApiOkResponse({ type: GetExamsResultsResponseDTO })
  getExamsResults(
    @CurrentUser() user: UserProfile,
  ): Promise<GetExamsResultsResponseDTO> {
    return this.examsService.getExamsResults(user.userId);
  }
}
