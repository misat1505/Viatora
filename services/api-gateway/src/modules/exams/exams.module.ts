import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { EXAMS_PACKAGE, GrpcClientsModule } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { createGrpcClientProvider } from 'src/grpc/utils/create-grpc-client-provider';
import { ExamServiceClient } from 'src/generated/exam';
import { EXAM_GRPC_CLIENT } from './exams.tokens';

@Module({
  imports: [GrpcClientsModule],
  controllers: [ExamsController],
  providers: [
    GrpcMetadataService,
    {
      provide: EXAM_GRPC_CLIENT,
      useClass: createGrpcClientProvider<ExamServiceClient>(
        EXAMS_PACKAGE,
        'ExamService',
      ),
    },
  ],
})
export class ExamsModule {}
