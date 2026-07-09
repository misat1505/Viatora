import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GrpcExceptionFilter } from './common/filters/grpc-exception-filter';
import * as yaml from 'js-yaml';
import fs from 'fs';
import { createOpenapi } from './utils/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GrpcExceptionFilter());

  const config = createOpenapi();

  const document = SwaggerModule.createDocument(app, config);

  const yamlDoc = yaml.dump(document);

  fs.writeFileSync('./openapi.yaml', yamlDoc, 'utf8');

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
