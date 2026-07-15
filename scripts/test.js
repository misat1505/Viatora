import concurrently from 'concurrently';
import { allServices, getActiveServices } from './config.js';

export const commands = {
  'api-gateway': 'pnpm test',
  'auth-service': 'uv run pytest .',
  'content-service': 'pnpm test',
  'exam-engine': 'pnpm test',
  'payment-service': 'node ./scripts/run-gradle.mjs --console=plain --quiet test',
  'ai-assistant': 'pnpm test',
  'statistics-service': 'uv run pytest .',
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
