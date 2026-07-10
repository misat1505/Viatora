import concurrently from 'concurrently';

concurrently(
  [
    {
      command: 'gradlew bootRun',
      name: 'run',
      cwd: './services/payment-service',
      prefixColor: 'redBright',
    },
    {
      command: 'gradlew classes --continuous',
      name: 'watch',
      cwd: './services/payment-service',
      prefixColor: 'red',
    },
  ],
  {
    prefix: 'name',
    killOthers: ['failure'],
  },
);
