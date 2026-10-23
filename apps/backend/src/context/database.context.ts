import { AsyncLocalStorage } from 'async_hooks';
import { Knex } from 'knex';
import { database } from '../../knexfile';
import { logApp } from '../utils/app-logger.util';
import { UnknownErrorCode } from '../utils/error/error.code';

type AfterCommitCallback = () => Promise<void> | void;

interface DatabaseContext {
  transaction?: Knex.Transaction;
  afterCommitCallbacks?: AfterCommitCallback[];
}

const dbAsyncLocalStorage = new AsyncLocalStorage<DatabaseContext>();

const runAfterCommitCallbacks = async (callbacks: AfterCommitCallback[]) => {
  for (const callback of callbacks) {
    try {
      await callback();
    } catch (error) {
      logApp.error('Error while running an after-commit callback', { error });
    }
  }
};

export const databaseContext = {
  withTransaction: async <T>(callback: () => Promise<T>): Promise<T> => {
    // If we're already in a transaction context, reuse it
    const existingContext = dbAsyncLocalStorage.getStore();
    if (existingContext?.transaction) {
      return callback();
    }

    // Create a new transaction
    const afterCommitCallbacks: AfterCommitCallback[] = [];
    const transactionResult = await database.transaction(async (trx) => {
      const context: DatabaseContext = {
        transaction: trx,
        afterCommitCallbacks,
      };

      return dbAsyncLocalStorage.run(context, async () => {
        const result = await callback();
        return result;
      });
    });

    // Only reached once the transaction is committed: a rollback throws above
    // and drops the callbacks.
    await runAfterCommitCallbacks(afterCommitCallbacks);
    return transactionResult;
  },

  /**
   * Run `callback` once the outermost transaction is committed, and never if
   * it rolls back. Outside a transaction it runs immediately. A failing
   * callback is logged and does not fail the caller, as the data is committed.
   */
  afterCommit: async (callback: AfterCommitCallback): Promise<void> => {
    const callbacks = dbAsyncLocalStorage.getStore()?.afterCommitCallbacks;
    if (callbacks) {
      callbacks.push(callback);
      return;
    }
    await runAfterCommitCallbacks([callback]);
  },

  withAdvisoryLock: async <T>(
    namespace: string,
    key: string,
    callback: () => Promise<T>
  ): Promise<T> =>
    databaseContext.withTransaction(async () => {
      const transaction = databaseContext.getTransaction();
      if (!transaction) {
        throw new Error(UnknownErrorCode.UnknownError);
      }
      await transaction.raw(
        'SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))',
        [namespace, key]
      );
      return callback();
    }),

  getTransaction: (): Knex.Transaction | undefined => {
    return dbAsyncLocalStorage.getStore()?.transaction;
  },

  clearTransaction: (): void => {
    const context = dbAsyncLocalStorage.getStore();
    if (context) {
      delete context.transaction;
    }
  },

  isInTransaction: (): boolean => {
    return !!dbAsyncLocalStorage.getStore()?.transaction;
  },
};

export const { afterCommit, withAdvisoryLock, withTransaction } =
  databaseContext;
