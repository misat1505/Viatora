import concurrently from 'concurrently';
import fs from 'fs';

fs.mkdirSync('./services/auth-service/generated', { recursive: true });

concurrently(
  [
    {
      command: 'pnpm buf generate',
      name: 'typescript',
      prefixColor: 'green',
    },
    {
      command:
        'cd services/auth-service && uv run -m grpc_tools.protoc -I ../../docs/communication/grpc --python_out ./generated --grpc_python_out ./generated ../../docs/communication/grpc/auth.proto && uv run ./fix_grpc_imports.py && cd ../statistics-service && uv run -m grpc_tools.protoc -I ../../docs/communication/grpc --python_out ./generated --grpc_python_out ./generated ../../docs/communication/grpc/exam.proto ../../docs/communication/grpc/content.proto ../../docs/communication/grpc/stats.proto && uv run ./fix_grpc_imports.py',
      name: 'python',
      prefixColor: 'blue',
    },
  ],
  {
    prefix: 'name',
    killOthers: ['failure'],
  },
);
