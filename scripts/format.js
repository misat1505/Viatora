import { spawnSync } from 'node:child_process';

const commands = [
  'prettier --write "**/*.{json,md,yml,yaml,css,java,ts,tsx,js,jsx}"',
  'ruff format .',
  'ruff check --fix .',
];

for (const command of commands) {
  const result = spawnSync(command, {
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
