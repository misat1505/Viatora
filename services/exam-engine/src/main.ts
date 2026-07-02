import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ServiceKeyGuard } from './common/guards/service-key.guard';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'Viatora.exam',
        protoPath: join(
          __dirname,
          '../../../../docs/communication/grpc/exam.proto',
        ),
        url: '0.0.0.0:50052',
      },
    },
  );

  const guard = app.get(ServiceKeyGuard);
  app.useGlobalGuards(guard);

  await app.listen();
}
void bootstrap();
