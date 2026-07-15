import concurrently from 'concurrently';
import { allServices, getActiveServices } from './config.js';

export const commands = {
  'api-gateway': 'pnpm install',
  'auth-service': 'uv sync',
  web: 'pnpm install',
  'content-service': 'pnpm install',
  'exam-engine': 'pnpm install',
  'ai-assistant': 'pnpm install',
  'statistics-service': 'uv sync',
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
