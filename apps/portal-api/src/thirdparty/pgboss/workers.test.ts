import { PgBoss, type JobWithMetadata } from 'pg-boss';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import portalConfig from '../../config';
import { HUBSPOT_QUEUES } from './hubspot.jobs';
import { HubspotWorkers } from './hubspot.workers';
import { RETRY_STRATEGIES } from './retry-strategies';

// ---------------------------------------------------------------------------
// Unit tests – verify queue wiring via a mocked PgBoss instance
// ---------------------------------------------------------------------------
describe('Workers – queue configuration (unit)', () => {
  it('should create deadletter queue and wire hubspot queues with standard retry + deadletter', async () => {
    const createQueue = vi.fn();
    const work = vi.fn();
    const boss = { createQueue, work } as unknown as PgBoss;

    await HubspotWorkers.start(boss);

    // Dead-letter queue created first (no options)
    expect(createQueue).toHaveBeenCalledWith(HUBSPOT_QUEUES.DEAD_LETTER);

    // Login queue
    expect(createQueue).toHaveBeenCalledWith(HUBSPOT_QUEUES.LOGIN, {
      ...RETRY_STRATEGIES.standard,
      deadLetter: HUBSPOT_QUEUES.DEAD_LETTER,
    });

    // ReachOutSales queue
    expect(createQueue).toHaveBeenCalledWith(HUBSPOT_QUEUES.REACH_OUT_SALES, {
      ...RETRY_STRATEGIES.standard,
      deadLetter: HUBSPOT_QUEUES.DEAD_LETTER,
    });

    // Workers registered for both queues
    expect(work).toHaveBeenCalledWith(
      HUBSPOT_QUEUES.LOGIN,
      { batchSize: 1 },
      expect.any(Function)
    );
    expect(work).toHaveBeenCalledWith(
      HUBSPOT_QUEUES.REACH_OUT_SALES,
      { batchSize: 1 },
      expect.any(Function)
    );
  });
});

// ---------------------------------------------------------------------------
// Integration tests – verify dead-letter behavior against real Postgres
// ---------------------------------------------------------------------------
describe('Workers – dead-letter routing (integration)', () => {
  let boss: PgBoss;
  const TEST_SCHEMA = 'pgboss_test';

  beforeAll(async () => {
    const { host, port, user, password, database } = portalConfig.database;

    boss = new PgBoss({
      host,
      port,
      user,
      password,
      database,
      schema: TEST_SCHEMA,
    });

    await boss.start();
  }, 5_000);

  afterAll(async () => {
    if (boss) {
      await boss.stop({ graceful: true, timeout: 1_000 });
    }
  }, 1_500);

  it('should move a failed job to the dead-letter queue after retries are exhausted', async () => {
    const testQueue = 'test_deadletter_source';
    const deadLetterQueue = 'test_deadletter_sink';

    // Create queues: source with retryLimit 0 so it dead-letters immediately
    await boss.createQueue(deadLetterQueue);
    await boss.createQueue(testQueue, {
      retryLimit: 0,
      deadLetter: deadLetterQueue,
    });

    // Register a worker that always fails
    await boss.work(testQueue, { batchSize: 1 }, async () => {
      throw new Error('Simulated failure');
    });

    // Enqueue a job
    const jobId = await boss.send(testQueue, {
      type: 'test',
      payload: { hello: 'world' },
    });

    expect(jobId).toBeTruthy();

    // Poll the dead-letter queue until the job appears (max ~10s)
    let deadLetterJobs: JobWithMetadata[] = [];
    const deadline = Date.now() + 10_000;

    while (Date.now() < deadline) {
      deadLetterJobs = await boss.fetch(deadLetterQueue, {
        batchSize: 10,
        includeMetadata: true,
      });

      if (deadLetterJobs.length > 0) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    expect(deadLetterJobs.length).toBeGreaterThanOrEqual(1);

    const dlJob = deadLetterJobs[0]!;
    expect(dlJob.data).toEqual({
      type: 'test',
      payload: { hello: 'world' },
    });

    // Cleanup
    await boss.deleteQueue(testQueue);
    await boss.deleteQueue(deadLetterQueue);
  }, 5_000);

  it('should NOT dead-letter a job that succeeds', async () => {
    const testQueue = 'test_success_source';
    const deadLetterQueue = 'test_success_sink';

    await boss.createQueue(deadLetterQueue);
    await boss.createQueue(testQueue, {
      retryLimit: 0,
      deadLetter: deadLetterQueue,
    });

    // Register a worker that succeeds
    await boss.work(testQueue, { batchSize: 1 }, async () => {
      // success – no throw
    });

    await boss.send(testQueue, { type: 'test', payload: { ok: true } });

    // Wait a bit for processing
    await new Promise((r) => setTimeout(r, 3_000));

    const deadLetterJobs = await boss.fetch(deadLetterQueue, {
      batchSize: 10,
    });

    expect(deadLetterJobs.length).toBe(0);

    // Cleanup
    await boss.deleteQueue(testQueue);
    await boss.deleteQueue(deadLetterQueue);
  }, 5_000);
});
