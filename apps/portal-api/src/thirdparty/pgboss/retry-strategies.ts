import type { QueueOptions } from 'pg-boss';

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export const RETRY_STRATEGIES = {
  standard: {
    retryLimit: 5,
    retryDelay: 30,
    retryBackoff: true,
  },
  dlq: {
    retryLimit: 0,
    retryDelay: 0,
    retryBackoff: false,
    retentionSeconds: THIRTY_DAYS_IN_SECONDS,
    deleteAfterSeconds: THIRTY_DAYS_IN_SECONDS,
  },
} as const satisfies Record<string, QueueOptions>;

export type RetryStrategyName = keyof typeof RETRY_STRATEGIES;
