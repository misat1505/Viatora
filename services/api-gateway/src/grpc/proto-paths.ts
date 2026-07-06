import { join } from 'path';

export const PROTO_PATHS = {
  auth: join(__dirname, '../../../../../docs/communication/grpc/auth.proto'),
  exam: join(__dirname, '../../../../../docs/communication/grpc/exam.proto'),
  content: join(
    __dirname,
    '../../../../../docs/communication/grpc/content.proto',
  ),
};
