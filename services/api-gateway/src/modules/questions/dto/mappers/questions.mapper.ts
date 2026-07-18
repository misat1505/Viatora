import { ContentServiceClient, ExamQuestion } from 'src/generated/content';
import { GrpcResponse } from 'src/grpc/types/grpc-client';
import { ExamsMapper } from 'src/modules/exams/dto/mapper/exams.mapper';
import { DetailedExamQuestionDTO } from '../detailed-question.dto';

type GetQuestionBySlugResponse = GrpcResponse<
  ContentServiceClient,
  'getQuestionBySlug'
>;
type GetQuestionsByFiltersResponse = GrpcResponse<
  ContentServiceClient,
  'getQuestionsByFilters'
>;

type GrpcQuestionWithExplanation = ExamQuestion & {
  explanation?: ExamQuestion['text'];
};

export class QuestionsMapper {
  static toDetailedExamQuestionDTO(
    question: GrpcQuestionWithExplanation,
  ): DetailedExamQuestionDTO {
    const base = ExamsMapper.toQuestionDTO(question);

    return {
      ...base,
      explanation: ExamsMapper.toLocaleDTO(question.explanation),
    };
  }

  static toDetailedExamQuestionDTOFromSingle(
    result: GetQuestionBySlugResponse,
  ): DetailedExamQuestionDTO {
    return this.toDetailedExamQuestionDTO(result);
  }

  static toDetailedExamQuestionDTOList(
    result: GetQuestionsByFiltersResponse,
  ): DetailedExamQuestionDTO[] {
    return result.questions.map((q) => this.toDetailedExamQuestionDTO(q));
  }
}
