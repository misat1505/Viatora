import concurrently from 'concurrently';
import { allServices, getActiveServices } from './config.js';

export const commands = {
  'api-gateway': 'pnpm lint',
  'auth-service': 'uv run mypy .',
  web: 'pnpm lint',
  'content-service': 'pnpm lint',
  'exam-engine': 'pnpm lint',
  'ai-assistant': 'pnpm lint',
};

const services = getActiveServices();

concurrently(
  services
    .filter(([name]) => commands[name])
    .map(([name, config]) => ({
      command: commands[name],
      name,
      cwd: config.cwd,
      prefixColor: config.color,
    })),
  {
    prefix: 'name',
    killOthers: ['failure'],
  },
);
