import type { JobWithMetadata, PgBoss, WorkOptions } from 'pg-boss';
import { logApp } from '../../utils/app-logger.util';
import { HUBSPOT_QUEUES } from './hubspot.jobs';
import { PgBossMetrics } from './pgboss.metrics';
import { TELEMETRY_QUEUES } from './telemetry.jobs';

/**
 * All dead-letter queue names that should be observed.
 * Add new DLQ names here when new domains are introduced.
 */
const DEAD_LETTER_QUEUES = [
  HUBSPOT_QUEUES.DEAD_LETTER,
  TELEMETRY_QUEUES.DEAD_LETTER,
] as const;

function handleDeadLetterJobs(jobs: JobWithMetadata<unknown>[]): Promise<void> {
  for (const job of jobs) {
    logApp.error('[PgBoss DLQ] Job dead-lettered', {
      dlqQueue: job.name,
      jobId: job.id,
      data: job.data,
      output: job.output,
      retryCount: job.retryCount,
      retryLimit: job.retryLimit,
      createdOn: job.createdOn,
    });

    PgBossMetrics.counters.jobsProcessed.inc({
      queue: job.name,
      result: 'deadletter',
    });
  }

  // Returning without error completes the DLQ jobs automatically.
  return Promise.resolve();
}

export const DeadLetterWorkers = {
  start: async (
    boss: PgBoss,
    options?: Partial<WorkOptions>
  ): Promise<void> => {
    for (const dlqName of DEAD_LETTER_QUEUES) {
      const queue = await boss.getQueue(dlqName);

      if (!queue) {
        logApp.warn(
          '[PgBoss DLQ] Queue does not exist, skipping worker registration',
          { queue: dlqName }
        );
        continue;
      }

      await boss.work(
        dlqName,
        { batchSize: 1, includeMetadata: true, ...options },
        handleDeadLetterJobs
      );
    }

    logApp.info('[PgBoss] Dead-letter workers started');
  },
};
