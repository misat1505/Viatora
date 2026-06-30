import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'Viatora.content',
        protoPath: join(
          __dirname,
          '../../../docs/communication/grpc/content.proto',
        ),
        url: '0.0.0.0:50054',
      },
    },
  );

  await app.listen();
}
void bootstrap();
