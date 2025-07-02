import { db } from '../db-utils/db-connection';

export const beforeEach = async () => {
  await db.raw('DROP SCHEMA public CASCADE;');
  await db.raw('CREATE SCHEMA public');
  await db.raw('GRANT ALL ON SCHEMA public TO public');

  await db.migrate.latest();
  await db.seed.run();
};
