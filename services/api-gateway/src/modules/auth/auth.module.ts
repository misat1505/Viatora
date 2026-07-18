import { Module } from '@nestjs/common';
import { AUTH_PACKAGE, GrpcClientsModule } from '../../grpc/clients.module';
import { AuthController } from './auth.controller';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { createGrpcClientProvider } from 'src/grpc/utils/create-grpc-client-provider';
import { AuthServiceClient } from 'src/generated/auth';
import { AUTH_GRPC_CLIENT } from './auth.tokens';
import { AuthService } from './auth.service';

@Module({
  imports: [GrpcClientsModule],
  controllers: [AuthController],
  providers: [
    GrpcMetadataService,
    AuthService,
    {
      provide: AUTH_GRPC_CLIENT,
      useClass: createGrpcClientProvider<AuthServiceClient>(
        AUTH_PACKAGE,
        'AuthService',
      ),
    },
  ],
})
export class AuthModule {}
