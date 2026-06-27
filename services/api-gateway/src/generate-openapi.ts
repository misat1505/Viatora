import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import * as yaml from 'js-yaml';
import fs from 'fs';
import { createOpenapi } from './utils/openapi';

async function generate() {
  const app = await NestFactory.create(AppModule);

  const config = createOpenapi();

  const document = SwaggerModule.createDocument(app, config);

  const yamlDoc = yaml.dump(document);

  fs.writeFileSync('./openapi.yaml', yamlDoc, 'utf8');

  await app.close();
}

void generate();
