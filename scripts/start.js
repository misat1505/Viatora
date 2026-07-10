import concurrently from 'concurrently';

const allServices = {
  'api-gateway': {
    command: 'pnpm start:prod',
    cwd: 'services/api-gateway',
    color: 'green',
  },
  'auth-service': {
    command: 'uv run ./main.py',
    cwd: 'services/auth-service',
    color: 'cyan',
  },
  web: {
    command: 'pnpm start',
    cwd: 'services/web',
    color: 'magenta',
  },
  'content-service': {
    command: 'pnpm start:prod',
    cwd: 'services/content-service',
    color: 'yellow',
  },
  'exam-engine': {
    command: 'pnpm start:prod',
    cwd: 'services/exam-engine',
    color: 'blue',
  },
  'payment-service': {
    command: 'java -jar build/libs/payment-service.jar --spring.profiles.active=local',
    cwd: 'services/payment-service',
    color: 'red',
  },
  'ai-assistant': {
    command: 'pnpm start:prod',
    cwd: 'services/ai-assistant',
    color: 'white',
  },
};

const args = process.argv.slice(2);

let services;

if (args[0] === 'omit') {
  const omitted = args.slice(1);

  services = Object.entries(allServices).filter(([name]) => !omitted.includes(name));
} else if (args.length > 0) {
  services = args.map((name) => [name, allServices[name]]);
} else {
  services = Object.entries(allServices);
}

concurrently(
  services.map(([name, config]) => ({
    command: config.command,
    name,
    cwd: config.cwd,
    prefixColor: config.color,
  })),
  {
    prefix: 'name',
    killOthers: ['failure'],
  },
);
