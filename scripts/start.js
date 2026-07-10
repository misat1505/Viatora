import concurrently from 'concurrently';
import { allServices, getActiveServices } from './config.js';

export const commands = {
  'api-gateway': 'pnpm start:prod',
  'auth-service': 'uv run ./main.py',
  web: 'pnpm start',
  'content-service': 'pnpm start:prod',
  'exam-engine': 'pnpm start:prod',
  'payment-service': 'java -jar build/libs/payment-service.jar --spring.profiles.active=local',
  'ai-assistant': 'pnpm start:prod',
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
