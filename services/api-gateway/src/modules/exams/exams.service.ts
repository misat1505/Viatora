import { Inject, Injectable } from '@nestjs/common';
import { ExamSessionDTO, StartExamDTO } from './dto/start-exam.dto';
import { ExamServiceClient } from 'src/generated/exam';
import { UserProfile } from 'src/generated/auth';
import {
  AnswerQuestionDTO,
  AnswerQuestionResponseDTO,
} from './dto/answer-question.dto';
import { SubmitExamResponseDTO } from './dto/submit-exam.dto';
import { GetExamsResultsResponseDTO } from './dto/get-exams-results.dto';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { ExamsMapper } from './dto/mapper/exams.mapper';
import { EXAM_GRPC_CLIENT } from './exams.tokens';

@Injectable()
export class ExamsService {
  constructor(
    @Inject(EXAM_GRPC_CLIENT)
    private readonly examClient: GrpcClientWrapper<ExamServiceClient>,
  ) {}

  async startExamSession(
    userId: UserProfile['userId'],
    dto: StartExamDTO,
  ): Promise<ExamSessionDTO> {
    const examSession = await this.examClient.service.startSession({
      category: dto.category,
      userId,
    });

    return ExamsMapper.toExamSessionDTO(examSession);
  }

  async getExamSession(
    userId: UserProfile['userId'],
    sessionId: string,
  ): Promise<ExamSessionDTO> {
    const examSession = await this.examClient.service.getSession({
      sessionId,
      userId,
    });

    return ExamsMapper.toExamSessionDTO(examSession);
  }

  async answerQuestion(
    userId: UserProfile['userId'],
    sessionId: string,
    dto: AnswerQuestionDTO,
  ): Promise<AnswerQuestionResponseDTO> {
    const result = await this.examClient.service.submitAnswer({
      sessionId,
      questionId: dto.questionId,
      selectedOption: dto.userAnswer,
      userId,
    });

    return ExamsMapper.toAnswerQuestionResponseDTO(result);
  }

  async finishSession(
    userId: UserProfile['userId'],
    sessionId: string,
  ): Promise<SubmitExamResponseDTO> {
    const result = await this.examClient.service.finishSession({
      sessionId,
      userId,
    });

    return ExamsMapper.toSubmitExamResponseDTO(result);
  }

  async getExamResult(
    userId: UserProfile['userId'],
    sessionId: string,
  ): Promise<SubmitExamResponseDTO> {
    const result = await this.examClient.service.getResult({
      sessionId,
      userId,
    });

    return ExamsMapper.toSubmitExamResponseDTO(result);
  }

  async getExamsResults(
    userId: UserProfile['userId'],
  ): Promise<GetExamsResultsResponseDTO> {
    const result = await this.examClient.service.listResults({
      userId,
    });

    return ExamsMapper.toGetExamsResultsResponseDTO(result);
  }
}
