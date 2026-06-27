import { DocumentBuilder } from '@nestjs/swagger';

export function createOpenapi() {
  return new DocumentBuilder()
    .setTitle('Viatora API')
    .setDescription('API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}
