import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DetailedExamQuestionDTO } from './dto/detailed-question.dto';
import { GetQuestionsQueryDTO } from './dto/get-questions.dto';
import { QuestionsService } from './questions.service';

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('/:slug')
  @ApiOkResponse({ type: DetailedExamQuestionDTO })
  getQuestionBySlug(
    @Param('slug') slug: string,
  ): Promise<DetailedExamQuestionDTO> {
    return this.questionsService.getQuestionBySlug(slug);
  }

  @Post()
  @ApiOkResponse({
    type: DetailedExamQuestionDTO,
    isArray: true,
  })
  getQuestions(
    @Body() body: GetQuestionsQueryDTO,
  ): Promise<DetailedExamQuestionDTO[]> {
    return this.questionsService.getQuestions(body);
  }
}
