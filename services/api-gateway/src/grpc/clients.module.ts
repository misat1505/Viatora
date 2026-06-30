import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PROTO_PATHS } from './proto-paths';
import { GrpcMetadataService } from './grpc-metadata.service';

export const AUTH_PACKAGE = 'AUTH_PACKAGE';
export const EXAMS_PACKAGE = 'EXAMS_PACKAGE';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_PACKAGE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'Viatora.auth',
            protoPath: PROTO_PATHS.auth,
            url: config.getOrThrow('AUTH_SERVICE_GRPC_URL'),
          },
        }),
      },
      {
        name: EXAMS_PACKAGE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'Viatora.exam',
            protoPath: PROTO_PATHS.exam,
            url: config.getOrThrow('EXAM_SERVICE_GRPC_URL'),
          },
        }),
      },
      // EXAM_PACKAGE, PAYMENT_PACKAGE, etc. — same pattern
    ]),
  ],
  providers: [GrpcMetadataService],
  exports: [ClientsModule, GrpcMetadataService],
})
export class GrpcClientsModule {}
