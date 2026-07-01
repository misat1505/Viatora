import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PROTO_PATHS } from './proto-paths';
import { GrpcMetadataService } from './grpc-metadata.service';

export const CONTENT_PACKAGE = 'CONTENT_PACKAGE';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CONTENT_PACKAGE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'Viatora.content',
            protoPath: PROTO_PATHS.content,
            url: config.getOrThrow('CONTENT_SERVICE_GRPC_URL'),
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
