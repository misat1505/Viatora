import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { GrpcClientsModule } from 'src/grpc/clients.module';

@Module({
  imports: [GrpcClientsModule],
  controllers: [ExamsController],
})
export class ExamsModule {}
