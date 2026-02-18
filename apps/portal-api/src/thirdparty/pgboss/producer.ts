import type { SendOptions } from 'pg-boss';
import { logApp } from '../../utils/app-logger.util';
import { PgBossApp } from './pgboss';
import { RETRY_STRATEGIES, type RetryStrategyName } from './retry-strategies';

export const PgBossProducer = {
  send: async <T extends object>(
    queueName: string,
    data: T,
    options?: SendOptions & { retryStrategy?: RetryStrategyName }
  ): Promise<string | null> => {
    const boss = PgBossApp.get();
    const { retryStrategy, ...sendOpts } = options ?? {};
    const strategyDefaults = RETRY_STRATEGIES[retryStrategy ?? 'standard'];
    const mergedOptions: SendOptions = {
      ...strategyDefaults,
      ...sendOpts,
    };
    const jobId = await boss.send(queueName, data, mergedOptions);
    logApp.debug(`[PgBoss] Job enqueued on "${queueName}"`, {
      jobId,
      queueName,
    });
    return jobId;
  },
};
