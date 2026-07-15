import { Module } from '@nestjs/common';
import { GrpcClientsModule } from 'src/grpc/clients.module';
import { StatsController } from './stats.controller';

@Module({ imports: [GrpcClientsModule], controllers: [StatsController] })
export class StatsModule {}
