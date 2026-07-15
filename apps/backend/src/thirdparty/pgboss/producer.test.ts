import { PgBoss, type JobSpyInterface } from 'pg-boss';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import portalConfig from '../../config';
import { databaseContext } from '../../context/database.context';
import { PgBossApp } from './pgboss';
import { PgBossProducer } from './producer';

// ---------------------------------------------------------------------------
// Integration tests – PgBossProducer transactional enqueue
// ---------------------------------------------------------------------------
describe('pgBossProducer – transactional enqueue (integration)', () => {
  let boss: PgBoss;
  const TEST_SCHEMA = 'pgboss_producer_test';
  const TEST_QUEUE = 'producer_txn_test';

  beforeEach(async () => {
    const { host, port, user, password, database } = portalConfig.database;

    boss = new PgBoss({
      host,
      port,
      user,
      password,
      database,
      schema: TEST_SCHEMA,
      __test__enableSpies: true,
    });

    await boss.start();

    // Make PgBossApp.get() return our test instance
    vi.spyOn(PgBossApp, 'get').mockReturnValue(boss);
  }, 10_000);

  beforeEach(async () => {
    boss.clearSpies();
    await boss.createQueue(TEST_QUEUE);
  });

  afterEach(async () => {
    await boss.deleteQueue(TEST_QUEUE);
  });

  afterAll(async () => {
    if (boss) {
      await boss.stop({ graceful: true, timeout: 2_000 });
    }
  }, 5_000);

  it('should enqueue a job when the transaction commits', async () => {
    const spy: JobSpyInterface = boss.getSpy(TEST_QUEUE);
    let jobId: string | null = null;

    await databaseContext.withTransaction(async () => {
      jobId = await PgBossProducer.send(TEST_QUEUE, {
        action: 'committed',
      });
    });

    expect(jobId).toBeTruthy();

    // Use the spy to wait for the job to appear in "created" state
    const createdJob = await spy.waitForJobWithId(jobId!, 'created');
    expect(createdJob.state).toBe('created');
    expect(createdJob.data).toEqual({ action: 'committed' });
  }, 5_000);

  it('should NOT enqueue a job when the transaction rolls back', async () => {
    let jobId: string | null = null;

    await expect(
      databaseContext.withTransaction(async () => {
        jobId = await PgBossProducer.send(TEST_QUEUE, {
          action: 'rolled_back',
        });

        throw new Error('Intentional rollback');
      })
    ).rejects.toThrow('Intentional rollback');

    // jobId was assigned before the throw, but the row should not exist
    expect(jobId).toBeTruthy();

    const jobs = await boss.findJobs(TEST_QUEUE, { id: jobId! });
    expect(jobs).toHaveLength(0);
  }, 5_000);

  describe('debounce', () => {
    const DEBOUNCE_QUEUE = 'producer_debounce_test';

    beforeEach(async () => {
      await boss.createQueue(DEBOUNCE_QUEUE, { policy: 'stately' });
    });

    afterEach(async () => {
      await boss.deleteQueue(DEBOUNCE_QUEUE);
    });

    it('inserts a delayed job on the first call for a given singletonKey', async () => {
      const before = Date.now();
      const result = await PgBossProducer.debounce(
        DEBOUNCE_QUEUE,
        { action: 'first' },
        { singletonKey: 'debounce-key-1', debounceSeconds: 60 }
      );
      const after = Date.now();

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);

      const [job] = await boss.findJobs(DEBOUNCE_QUEUE, {
        id: result.jobs[0]!,
      });
      expect(job.data).toEqual({ action: 'first' });
      const startAfter = new Date(job.startAfter).getTime();
      expect(startAfter).toBeGreaterThanOrEqual(before + 60_000);
      expect(startAfter).toBeLessThanOrEqual(after + 60_000);
    }, 5_000);

    it('resets startAfter instead of inserting a duplicate on a later call with the same singletonKey', async () => {
      const first = await PgBossProducer.debounce(
        DEBOUNCE_QUEUE,
        { action: 'first' },
        { singletonKey: 'debounce-key-2', debounceSeconds: 60 }
      );

      const second = await PgBossProducer.debounce(
        DEBOUNCE_QUEUE,
        { action: 'second' },
        { singletonKey: 'debounce-key-2', debounceSeconds: 60 }
      );

      expect(second.inserted).toBe(0);
      expect(second.updated).toBe(1);
      expect(second.jobs[0]).toBe(first.jobs[0]);

      const [job] = await boss.findJobs(DEBOUNCE_QUEUE, { id: first.jobs[0]! });
      expect(job.data).toEqual({ action: 'second' });
    }, 5_000);

    it('inserts a separate job for a different singletonKey', async () => {
      const first = await PgBossProducer.debounce(
        DEBOUNCE_QUEUE,
        { action: 'a' },
        { singletonKey: 'debounce-key-a', debounceSeconds: 60 }
      );
      const second = await PgBossProducer.debounce(
        DEBOUNCE_QUEUE,
        { action: 'b' },
        { singletonKey: 'debounce-key-b', debounceSeconds: 60 }
      );

      expect(first.jobs[0]).not.toBe(second.jobs[0]);
    }, 5_000);
  });
});
