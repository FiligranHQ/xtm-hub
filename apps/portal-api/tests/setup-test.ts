import { beforeAll } from 'vitest';
import { RequestContext } from '../src/requestContext';
import { closeDbTestConnection, getDbTestConnection } from './config-test';
import { requestContextAdminUser } from './tests.const';

function isUtilOrHelper(filepath?: string) {
  if (!filepath) return true;
  return /\b(util|utils|helper|helpers|pure|mock|stub|constant|constants|types)\b/i.test(
    filepath
  );
}

const testRequestStorage = new Map<string, RequestContext>();

function getTestKey() {
  const state = expect.getState();

  // For tests: use test name
  if (state?.currentTestName) {
    return `${state.testPath}:${state.currentTestName}`;
  }

  // For beforeAll: use line number from stack
  const stack = new Error().stack || '';
  const match = stack.match(/:(\d+):/);
  const line = match ? match[1] : Date.now();

  return `${state?.testPath}:beforeAll:${line}`;
}

vi.mock('async_hooks', () => {
  class MockAsyncLocalStorage<T> {
    getStore() {
      const key = getTestKey();

      if (!testRequestStorage.has(key)) {
        testRequestStorage.set(key, requestContextAdminUser);
      }

      return testRequestStorage.get(key) as T;
    }

    run(store: T, callback: () => any) {
      const key = getTestKey();
      const prev = testRequestStorage.get(key);
      testRequestStorage.set(key, store as any);
      try {
        return callback();
      } finally {
        if (prev) {
          testRequestStorage.set(key, prev);
        } else {
          testRequestStorage.delete(key);
        }
      }
    }

    enterWith(store: T) {
      const key = getTestKey();
      testRequestStorage.set(key, store as any);
    }
  }

  return { AsyncLocalStorage: MockAsyncLocalStorage };
});

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
