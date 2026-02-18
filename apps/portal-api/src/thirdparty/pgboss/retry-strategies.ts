import type { QueueOptions } from 'pg-boss';

export const RETRY_STRATEGIES = {
  standard: {
    retryLimit: 5,
    retryDelay: 30,
    retryBackoff: true,
  },
} as const satisfies Record<string, QueueOptions>;

export type RetryStrategyName = keyof typeof RETRY_STRATEGIES;
