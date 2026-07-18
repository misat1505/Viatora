import { Inject, Injectable } from '@nestjs/common';
import { StatsServiceClient } from 'src/generated/stats';
import { GetSummaryResponseDTO } from './dto/get-summary.dto';
import { UserProfile } from 'src/generated/auth';
import { STATS_GRPC_CLIENT } from './stats.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { StatsMapper } from './dto/mappers/stats.mapper';

@Injectable()
export class StatsService {
  constructor(
    @Inject(STATS_GRPC_CLIENT)
    private readonly statsClient: GrpcClientWrapper<StatsServiceClient>,
  ) {}

  async getStatsSummary(
    userId: UserProfile['userId'],
  ): Promise<GetSummaryResponseDTO> {
    const result = await this.statsClient.service.getSummary({
      userId,
    });

    return StatsMapper.toGetSummaryResponseDTO(result);
  }
}
