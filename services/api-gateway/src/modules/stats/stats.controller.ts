import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { GetSummaryResponseDTO } from './dto/get-summary.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { StatsService } from './stats.service';

@Controller('/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('/sumamry')
  @ApiOkResponse({ type: GetSummaryResponseDTO })
  getStatsSummary(
    @CurrentUser() user: UserProfile,
  ): Promise<GetSummaryResponseDTO> {
    return this.statsService.getStatsSummary(user.userId);
  }
}
