import { createDatabase } from '../config-test';

try {
  await createDatabase();
} catch (e) {
  console.error(e);
  process.exit(1);
}
console.log('Database created');
process.exit(0);
