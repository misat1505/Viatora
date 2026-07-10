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
        package: 'Viatora.assistant',
        protoPath: join(
          __dirname,
          '../../../docs/communication/grpc/assistant.proto',
        ),
        url: '0.0.0.0:50056',
      },
    },
  );

  // TODO: add service key quard
  // const guard = app.get(ServiceKeyGuard);
  // app.useGlobalGuards(guard);

  await app.listen();
}
void bootstrap();
