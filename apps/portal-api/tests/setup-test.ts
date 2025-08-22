import { beforeAll } from 'vitest';
import { closeDbTestConnection, getDbTestConnection } from './config-test';

function isUtilOrHelper(filepath?: string) {
  if (!filepath) return true;
  return /\b(util|utils|helper|helpers|pure|mock|stub|constant|constants|types)\b/i.test(
    filepath
  );
}

beforeAll(async (suite) => {
  const currentFile = suite?.file?.name;

  if (isUtilOrHelper(currentFile)) {
    console.log('⚠️ Did not clean', currentFile);
    return;
  }

  console.log('🧹 Clean up DB', currentFile);
  const startTime = Date.now();

  try {
    const db = getDbTestConnection();

    await db.transaction(async (trx) => {
      await trx.raw('DROP SCHEMA public CASCADE;');
      await trx.raw('CREATE SCHEMA public');
      await trx.raw('GRANT ALL ON SCHEMA public TO public');
    });

    const [lastMigration] = await db('migrations')
      .orderBy('id', 'desc')
      .limit(1)
      .catch(() => [null]);

    if (!lastMigration) {
      console.log('📦 Running migrations...');
      await db.migrate.latest();
    }

    console.log('🌱 Running seeds...');
    await db.seed.run();

    const duration = Date.now() - startTime;
    console.log(`✅ DB setup completed in ${duration}ms`);
  } catch (error) {
    console.error('❌ DB Setup error:', error);
    throw error;
  }
}, 60000);

process.on('SIGINT', async () => {
  await closeDbTestConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDbTestConnection();
  process.exit(0);
});
