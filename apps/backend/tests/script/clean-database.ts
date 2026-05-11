import { cleanDatabase } from '../config-test';

try {
  await cleanDatabase();
} catch (e) {
  console.error(e);
  process.exit(1);
}
console.log('Database cleaned');
process.exit(0);
