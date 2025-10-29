import { AsyncLocalStorage } from 'async_hooks';
import { Knex } from 'knex';
import { database } from '../../knexfile';

interface DatabaseContext {
  transaction?: Knex.Transaction;
}

const dbAsyncLocalStorage = new AsyncLocalStorage<DatabaseContext>();

export const databaseContext = {
  withTransaction: async <T>(callback: () => Promise<T>): Promise<T> => {
    // If we're already in a transaction context, reuse it
    const existingContext = dbAsyncLocalStorage.getStore();
    if (existingContext?.transaction) {
      return callback();
    }

    // Create a new transaction
    return database.transaction(async (trx) => {
      const context: DatabaseContext = { transaction: trx };

      return dbAsyncLocalStorage.run(context, async () => {
        const result = await callback();
        return result;
      });
    });
  },

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

export const { withTransaction } = databaseContext;
