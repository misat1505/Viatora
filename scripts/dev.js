import concurrently from 'concurrently';
import { allServices, getActiveServices } from './config.js';

export const commands = {
  'api-gateway': 'pnpm start:dev',
  'auth-service': 'uv run ./dev.py',
  web: 'pnpm dev',
  'content-service': 'pnpm start:dev',
  'exam-engine': 'pnpm start:dev',
  'payment-service': 'node ./scripts/payment-service-dev.js',
  'ai-assistant': 'pnpm start:dev',
  'statistics-service': 'uv run ./dev.py',
};

const services = getActiveServices();

concurrently(
  services
    .filter(([name]) => commands[name])
    .map(([name, config]) => ({
      command: commands[name],
      name,
      cwd: name === 'payment-service' ? process.cwd() : config.cwd,
      prefixColor: config.color,
    })),
  {
    prefix: 'name',
    killOthers: ['failure'],
  },
);
