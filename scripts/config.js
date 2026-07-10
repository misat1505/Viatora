export const allServices = {
  'api-gateway': {
    cwd: 'services/api-gateway',
    color: 'green',
  },
  'auth-service': {
    cwd: 'services/auth-service',
    color: 'cyan',
  },
  web: {
    cwd: 'services/web',
    color: 'magenta',
  },
  'content-service': {
    cwd: 'services/content-service',
    color: 'yellow',
  },
  'exam-engine': {
    cwd: 'services/exam-engine',
    color: 'blue',
  },
  'payment-service': {
    cwd: 'services/payment-service',
    color: 'red',
  },
  'ai-assistant': {
    cwd: 'services/ai-assistant',
    color: 'white',
  },
};

export function getActiveServices() {
  const args = process.argv.slice(2);

  if (args[0] === 'omit') {
    const omitted = args.slice(1);
    return Object.entries(allServices).filter(([name]) => !omitted.includes(name));
  } else if (args.length > 0) {
    return args.map((name) => [name, allServices[name]]);
  } else {
    return Object.entries(allServices);
  }
}
