import concurrently from 'concurrently';
import { allServices, getActiveServices } from './config.js';

export const commands = {
  'api-gateway': 'pnpm build',
  web: 'pnpm build',
  'content-service': 'pnpm build',
  'exam-engine': 'pnpm build',
  'payment-service': 'node ./scripts/run-gradle.mjs --console=plain --quiet clean build',
  'ai-assistant': 'pnpm build',
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
