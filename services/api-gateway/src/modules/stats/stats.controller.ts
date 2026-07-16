import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiOkResponse } from '@nestjs/swagger';
import { STATS_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
import { StatsServiceClient } from 'src/generated/stats';
import { GetSummaryResponseDTO } from './dto/get-summary.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';

@Controller('/stats')
@UseGuards(JwtAuthGuard)
export class StatsController implements OnModuleInit {
  private statsService!: StatsServiceClient;

  constructor(
    @Inject(STATS_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.statsService =
      this.grpcClient.getService<StatsServiceClient>('StatsService');
  }

  @Get('/sumamry')
  @ApiOkResponse({ type: GetSummaryResponseDTO })
  async getStatsSummary(
    @CurrentUser() user: UserProfile,
  ): Promise<GetSummaryResponseDTO> {
    const result = await firstValueFrom(
      this.statsService.getSummary(
        { userId: user.userId },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }
}
