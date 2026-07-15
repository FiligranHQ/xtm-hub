import type { Knex } from 'knex';
import type { SendOptions, UpsertResponse } from 'pg-boss';
import { databaseContext } from '../../context/database.context';
import { logApp } from '../../utils/app-logger.util';
import { PgBossApp } from './pgboss';
import { RETRY_STRATEGIES, type RetryStrategyName } from './retry-strategies';

const knexTransactionToPgBossDb = (
  trx: Knex.Transaction
): NonNullable<SendOptions['db']> => ({
  executeSql: async (text: string, values?: unknown[]) => {
    // pg-boss uses $1-style placeholders, but knex.raw() expects ?-style.
    // To avoid binding mismatches we execute the SQL directly on the
    // underlying pg connection that backs this Knex transaction.
    const conn = await trx.client.acquireConnection();
    try {
      const result = await trx.client.query(conn, {
        sql: text,
        bindings: values ?? [],
      });
      const rows = result?.response?.rows ?? [];
      return { rows };
    } finally {
      trx.client.releaseConnection(conn);
    }
  },
});

const getTransactionDbAdapter = ():
  NonNullable<SendOptions['db']> | undefined => {
  const trx = databaseContext.getTransaction();
  return trx && !trx.isCompleted() ? knexTransactionToPgBossDb(trx) : undefined;
};

export const PgBossProducer = {
  send: async <T extends object>(
    queueName: string,
    data: T,
    options?: SendOptions & { retryStrategy?: RetryStrategyName }
  ): Promise<string | null> => {
    const boss = PgBossApp.get();
    const { retryStrategy, ...sendOpts } = options ?? {};
    const strategyDefaults = RETRY_STRATEGIES[retryStrategy ?? 'standard'];
    const dbAdapter = getTransactionDbAdapter();

    const mergedOptions: SendOptions = {
      ...strategyDefaults,
      ...sendOpts,
      ...(dbAdapter ? { db: dbAdapter } : {}),
    };
    const jobId = await boss.send(queueName, data, mergedOptions);
    logApp.debug(`[PgBoss] Job enqueued on "${queueName}"`, {
      jobId,
      queueName,
    });
    return jobId;
  },

  /**
   * Trailing-edge debounce: pushes `startAfter` out on each call, so the
   * job only fires `debounceSeconds` after the last call for a given
   * `singletonKey`. Requires a queue policy allowing at most one
   * queued/active job per key (e.g. `stately`).
   */
  debounce: async <T extends object>(
    queueName: string,
    data: T,
    {
      singletonKey,
      debounceSeconds,
    }: { singletonKey: string; debounceSeconds: number }
  ): Promise<UpsertResponse> => {
    const boss = PgBossApp.get();
    const dbAdapter = getTransactionDbAdapter();
    const startAfter = new Date(Date.now() + debounceSeconds * 1000);

    const result = await boss.upsert(queueName, data, {
      singletonKey,
      startAfter,
      ...(dbAdapter ? { db: dbAdapter } : {}),
    });
    logApp.debug(`[PgBoss] Job debounced on "${queueName}"`, {
      queueName,
      singletonKey,
      startAfter,
    });
    return result;
  },
};
