import type { PgBoss } from 'pg-boss';
import { Counter, Gauge, Histogram } from 'prom-client';
import { logApp } from '../../utils/app-logger.util';

const POLL_INTERVAL_MS = 30_000;

let pollTimer: ReturnType<typeof setInterval> | null = null;

const queueJobs = new Gauge({
  name: 'pgboss_queue_jobs',
  help: 'Number of jobs in PgBoss queues by state',
  labelNames: ['queue', 'state'] as const,
});

const jobsProcessed = new Counter({
  name: 'pgboss_jobs_processed_total',
  help: 'Total number of PgBoss jobs processed',
  labelNames: ['queue', 'result'] as const,
});

const jobDuration = new Histogram({
  name: 'pgboss_job_duration_seconds',
  help: 'Duration of PgBoss job processing in seconds',
  labelNames: ['queue'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
});

const warningTotal = new Counter({
  name: 'pgboss_warning_total',
  help: 'Total number of PgBoss warnings',
  labelNames: ['type'] as const,
});

const errorTotal = new Counter({
  name: 'pgboss_error_total',
  help: 'Total number of PgBoss errors',
});

async function pollQueueStats(boss: PgBoss): Promise<void> {
  try {
    const queues = await boss.getQueues();
    for (const q of queues) {
      queueJobs.set({ queue: q.name, state: 'queued' }, q.queuedCount);
      queueJobs.set({ queue: q.name, state: 'active' }, q.activeCount);
      queueJobs.set({ queue: q.name, state: 'deferred' }, q.deferredCount);
      queueJobs.set({ queue: q.name, state: 'total' }, q.totalCount);
    }
  } catch (err) {
    logApp.warn('[PgBoss Metrics] Failed to poll queue stats', { err });
  }
}

const onWarning = (w: { message: string; data: object }) => {
  const type = (w.data as Record<string, unknown>)?.type ?? 'unknown';
  warningTotal.inc({ type: String(type) });
};

const onError = () => {
  errorTotal.inc();
};

export const PgBossMetrics = {
  counters: {
    queueJobs,
    jobsProcessed,
    jobDuration,
    warningTotal,
    errorTotal,
  },

  start: (boss: PgBoss): void => {
    boss.on('warning', onWarning);
    boss.on('error', onError);

    // Initial poll, then every POLL_INTERVAL_MS
    void pollQueueStats(boss);
    pollTimer = setInterval(() => void pollQueueStats(boss), POLL_INTERVAL_MS);

    logApp.info(
      `[PgBoss Metrics] Started (poll every ${POLL_INTERVAL_MS / 1000}s)`
    );
  },

  stop: (): void => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    logApp.info('[PgBoss Metrics] Stopped');
  },
};
