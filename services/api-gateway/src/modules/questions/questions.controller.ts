import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ContentServiceClient } from 'src/generated/content';
import { DetailedExamQuestionDTO } from './dto/detailed-question.dto';
import { GetQuestionsQueryDTO } from './dto/get-questions.dto';
import { QUESTIONS_GRPC_CLIENT } from './questions.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { QuestionsMapper } from './dto/mappers/questions.mapper';

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    @Inject(QUESTIONS_GRPC_CLIENT)
    private readonly questionsClient: GrpcClientWrapper<ContentServiceClient>,
  ) {}

  @Get('/:slug')
  @ApiOkResponse({ type: DetailedExamQuestionDTO })
  async getQuestionBySlug(
    @Param('slug') slug: string,
  ): Promise<DetailedExamQuestionDTO> {
    const result = await this.questionsClient.service.getQuestionBySlug({
      slug,
    });

    return QuestionsMapper.toDetailedExamQuestionDTOFromSingle(result);
  }

  @Post()
  @ApiOkResponse({
    type: DetailedExamQuestionDTO,
    isArray: true,
  })
  async getQuestions(
    @Body() body: GetQuestionsQueryDTO,
  ): Promise<DetailedExamQuestionDTO[]> {
    const result = await this.questionsClient.service.getQuestionsByFilters({
      ...(body as Required<GetQuestionsQueryDTO>),
    });

    return QuestionsMapper.toDetailedExamQuestionDTOList(result);
  }
}
