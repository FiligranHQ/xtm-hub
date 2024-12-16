import { createDatabase } from '../config-test';

await createDatabase();
console.log('Database created');
process.exit(0);
