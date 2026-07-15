import { join } from 'path';

export const PROTO_PATHS = {
  auth: join(__dirname, '../../../../../docs/communication/grpc/auth.proto'),
  exam: join(__dirname, '../../../../../docs/communication/grpc/exam.proto'),
  content: join(
    __dirname,
    '../../../../../docs/communication/grpc/content.proto',
  ),
  payment: join(
    __dirname,
    '../../../../../docs/communication/grpc/payment.proto',
  ),
  assistant: join(
    __dirname,
    '../../../../../docs/communication/grpc/assistant.proto',
  ),
  stats: join(__dirname, '../../../../../docs/communication/grpc/stats.proto'),
};
