import { StatsServiceClient } from 'src/generated/stats';
import { GrpcResponse } from 'src/grpc/types/grpc-client';
import { GetSummaryResponseDTO } from '../get-summary.dto';

type GetSummaryResponse = GrpcResponse<StatsServiceClient, 'getSummary'>;

export class StatsMapper {
  static toGetSummaryResponseDTO(
    result: GetSummaryResponse,
  ): GetSummaryResponseDTO {
    return {
      totalExams: result.totalExams,
      passRate: result.passRate,
      averageScore: result.averageScore,
      bestScore: result.bestScore,
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      totalTimeMinutes: result.totalTimeMinutes,
    };
  }
}
