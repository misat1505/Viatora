import { Module } from '@nestjs/common';
import { GrpcClientsModule, STATS_PACKAGE } from 'src/grpc/clients.module';
import { StatsController } from './stats.controller';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { STATS_GRPC_CLIENT } from './stats.tokens';
import { createGrpcClientProvider } from 'src/grpc/utils/create-grpc-client-provider';
import { StatsServiceClient } from 'src/generated/stats';

@Module({
  imports: [GrpcClientsModule],
  controllers: [StatsController],
  providers: [
    GrpcMetadataService,
    {
      provide: STATS_GRPC_CLIENT,
      useClass: createGrpcClientProvider<StatsServiceClient>(
        STATS_PACKAGE,
        'StatsService',
      ),
    },
  ],
})
export class StatsModule {}
