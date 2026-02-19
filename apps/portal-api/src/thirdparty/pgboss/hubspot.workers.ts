import type { Job, PgBoss } from 'pg-boss';
import { logApp } from '../../utils/app-logger.util';
import { hubspotWebhookSend } from '../hubspot/hubspot';
import {
  HUBSPOT_QUEUES,
  HUBSPOT_TYPE_TO_QUEUE,
  type HubspotJobData,
} from './hubspot.jobs';
import { PgBossMetrics } from './pgboss.metrics';
import { RETRY_STRATEGIES } from './retry-strategies';

const handleHubspotJob = async (jobs: Job<HubspotJobData>[]) => {
  for (const job of jobs) {
    logApp.info(`[PgBoss] Processing ${job.name} job`, { jobId: job.id });

    const end = PgBossMetrics.counters.jobDuration.startTimer({
      queue: job.name,
    });
    try {
      await hubspotWebhookSend(job.data.type, job.data.payload);
      PgBossMetrics.counters.jobsProcessed.inc({
        queue: job.name,
        result: 'success',
      });
    } catch (err) {
      PgBossMetrics.counters.jobsProcessed.inc({
        queue: job.name,
        result: 'error',
      });
      throw err;
    } finally {
      end();
    }
  }
};

export const HubspotWorkers = {
  start: async (boss: PgBoss): Promise<void> => {
    await boss.createQueue(HUBSPOT_QUEUES.DEAD_LETTER);

    for (const queueName of Object.values(HUBSPOT_TYPE_TO_QUEUE)) {
      await boss.createQueue(queueName, {
        ...RETRY_STRATEGIES.standard,
        deadLetter: HUBSPOT_QUEUES.DEAD_LETTER,
      });

      await boss.work<HubspotJobData>(
        queueName,
        { batchSize: 1 },
        handleHubspotJob
      );
    }

    logApp.info('[PgBoss] HubSpot workers started');
  },
};
