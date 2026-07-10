import { spawnSync } from 'node:child_process';

const services = ['./services/api-gateway', './services/web'];

for (const cwd of services) {
  const result = spawnSync('pnpm', ['openapi:gen'], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
