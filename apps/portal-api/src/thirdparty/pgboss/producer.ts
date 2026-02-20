import type { Knex } from 'knex';
import type { SendOptions } from 'pg-boss';
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

export const PgBossProducer = {
  send: async <T extends object>(
    queueName: string,
    data: T,
    options?: SendOptions & { retryStrategy?: RetryStrategyName }
  ): Promise<string | null> => {
    const boss = PgBossApp.get();
    const { retryStrategy, ...sendOpts } = options ?? {};
    const strategyDefaults = RETRY_STRATEGIES[retryStrategy ?? 'standard'];
    const trx = databaseContext.getTransaction();
    const dbAdapter =
      trx && !trx.isCompleted() ? knexTransactionToPgBossDb(trx) : undefined;

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
};
