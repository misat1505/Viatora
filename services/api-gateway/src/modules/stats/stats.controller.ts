import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { StatsServiceClient } from 'src/generated/stats';
import { GetSummaryResponseDTO } from './dto/get-summary.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { STATS_GRPC_CLIENT } from './stats.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { StatsMapper } from './dto/mappers/stats.mapper';

@Controller('/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(
    @Inject(STATS_GRPC_CLIENT)
    private readonly statsClient: GrpcClientWrapper<StatsServiceClient>,
  ) {}

  @Get('/sumamry')
  @ApiOkResponse({ type: GetSummaryResponseDTO })
  async getStatsSummary(
    @CurrentUser() user: UserProfile,
  ): Promise<GetSummaryResponseDTO> {
    const result = await this.statsClient.service.getSummary({
      userId: user.userId,
    });

    return StatsMapper.toGetSummaryResponseDTO(result);
  }
}
