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
});
