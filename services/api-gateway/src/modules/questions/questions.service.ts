import { Inject, Injectable } from '@nestjs/common';
import { ContentServiceClient } from 'src/generated/content';
import { DetailedExamQuestionDTO } from './dto/detailed-question.dto';
import { GetQuestionsQueryDTO } from './dto/get-questions.dto';
import { QUESTIONS_GRPC_CLIENT } from './questions.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { QuestionsMapper } from './dto/mappers/questions.mapper';

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(QUESTIONS_GRPC_CLIENT)
    private readonly questionsClient: GrpcClientWrapper<ContentServiceClient>,
  ) {}

  async getQuestionBySlug(slug: string): Promise<DetailedExamQuestionDTO> {
    const result = await this.questionsClient.service.getQuestionBySlug({
      slug,
    });

    return QuestionsMapper.toDetailedExamQuestionDTOFromSingle(result);
  }

  async getQuestions(
    dto: GetQuestionsQueryDTO,
  ): Promise<DetailedExamQuestionDTO[]> {
    const result = await this.questionsClient.service.getQuestionsByFilters({
      ...(dto as Required<GetQuestionsQueryDTO>),
    });

    return QuestionsMapper.toDetailedExamQuestionDTOList(result);
  }
}
