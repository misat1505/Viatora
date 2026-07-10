import fs from 'fs';

const paths = [
  { dir: 'services/api-gateway', dest: '.env' },
  { dir: 'services/auth-service', dest: '.env' },
  { dir: 'services/web', dest: '.env.local' },
  { dir: 'services/content-service', dest: '.env' },
  { dir: 'services/exam-engine', dest: '.env' },
  { dir: 'services/payment-service', dest: '.env' },
  { dir: 'services/ai-assistant', dest: '.env' },
];

paths.forEach(({ dir, dest }) => {
  if (!fs.existsSync(dir + '/' + dest)) fs.copyFileSync(dir + '/.env.example', dir + '/' + dest);
});
