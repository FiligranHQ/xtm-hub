import { afterEach, beforeAll } from 'vitest';
import { requestContext, RequestContext } from '../src/context/request.context';
import { closeDbTestConnection, getDbTestConnection } from './config-test';
import { requestContextSimpleUserFiligran2 } from './tests.const';

function isUtilOrHelper(filepath?: string) {
  if (!filepath) return true;
  return /\b(util|utils|helper|helpers|pure|mock|stub|constant|constants|types)\b/i.test(
    filepath
  );
}

const testRequestStorage = new Map<string, RequestContext>();

function getCurrentTestKey() {
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

function mockRequestContext() {
  const originalRequestContext = {
    get: requestContext.get,
    require: requestContext.require,
    update: requestContext.update,
    set: requestContext.set,
    run: requestContext.run,
  };

  requestContext.get = vi.fn(() => {
    const testKey = getCurrentTestKey();
    return (
      testRequestStorage.get(testKey) || {
        ...requestContextSimpleUserFiligran2,
      }
    );
  });

  requestContext.require = vi.fn(() => {
    const context = requestContext.get();
    if (!context) {
      throw new Error('No async context available');
    }
    return context;
  });

  requestContext.update = vi.fn((updates) => {
    const testKey = getCurrentTestKey();
    const current = testRequestStorage.get(testKey) || {
      ...requestContextSimpleUserFiligran2,
    };
    testRequestStorage.set(testKey, { ...current, ...updates });
  });

  requestContext.set = vi.fn((context) => {
    const testKey = getCurrentTestKey();
    testRequestStorage.set(testKey, context);
  });

  requestContext.run = vi.fn((context, callback) => {
    const testKey = getCurrentTestKey();
    const previousContext = testRequestStorage.get(testKey);
    testRequestStorage.set(testKey, context);
    try {
      return callback();
    } finally {
      if (previousContext) {
        testRequestStorage.set(testKey, previousContext);
      } else {
        testRequestStorage.delete(testKey);
      }
    }
  });

  (globalThis as any).__originalRequestContext = originalRequestContext;
}

beforeEach(() => {
  // Set fresh context for each test
  const testKey = getCurrentTestKey();
  testRequestStorage.set(testKey, { ...requestContextSimpleUserFiligran2 });
});

beforeAll(async ({}, suite) => {
  mockRequestContext();

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

afterEach(() => {
  vi.restoreAllMocks();
});

process.on('SIGINT', async () => {
  await closeDbTestConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDbTestConnection();
  process.exit(0);
});
