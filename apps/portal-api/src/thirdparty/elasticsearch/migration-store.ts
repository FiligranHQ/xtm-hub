import { MigrationSet } from 'migrate';
import { logApp } from '../../utils/app-logger.util';
import { ElasticSearchService, esDbClient } from './client';
import {
  LOCK_DOC_ID,
  MIGRATION_INDEX,
  MIGRATION_LOCK_INDEX,
} from './migration.const';

interface MigrationObject {
  title: string;
  timestamp: number;
}
interface MigrationState {
  lastRun: string | null;
  migrations: Array<MigrationObject>;
}

export interface StateStore {
  load: (fn: (err: Error | null, state?: MigrationState) => void) => void;
  save: (set: MigrationSet, fn: (err?: Error) => void) => void;
  lock: () => Promise<boolean>;
  unlock: () => Promise<void>;
}

const lockDoc = {
  type: 'migration-lock',
  command: 'up',
  timestamp: new Date().toISOString(),
};

export function createEsStateStorage(
  client?: ElasticSearchService,
  state?: MigrationState
): StateStore {
  const esClient = client || esDbClient;
  let loadedState: MigrationState = state;

  return {
    load: async (fn) => {
      try {
        const migrations = (await esClient.simpleSearch({
          index: MIGRATION_INDEX,
          size: 1000,
          sort: [{ timestamp: 'asc' }],
        })) as MigrationObject[];

        loadedState = {
          lastRun: migrations[migrations.length - 1]?.title || null,
          migrations,
        };

        fn(null, loadedState);
      } catch (error) {
        if (error.meta?.statusCode === 404) {
          const emptyState: MigrationState = {
            lastRun: null,
            migrations: [],
          };
          loadedState = emptyState;
          fn(null, emptyState);
        } else {
          fn(error);
        }
      }
    },

    save: async (set: MigrationSet, fn) => {
      try {
        if (loadedState) {
          const oldMigrations = new Map(
            loadedState.migrations.map((m: MigrationObject) => [
              m.title,
              m.timestamp,
            ])
          );
          if (set.migrations) {
            for (const migration of set.migrations) {
              const migrationName = migration.title;
              const previousMigration = oldMigrations.get(migrationName);
              // up migration have the timestamp added
              if (migration.timestamp && !previousMigration) {
                await esClient.index({
                  index: MIGRATION_INDEX,
                  id: migrationName,
                  document: {
                    title: migrationName,
                    timestamp: migration.timestamp,
                  },
                });
                logApp.info('Processed migration file', {
                  name: migrationName,
                });

                // down migrations have the timestamp removed
              } else if (!migration.timestamp && previousMigration) {
                await esClient.delete({
                  index: MIGRATION_INDEX,
                  id: migrationName,
                });
                logApp.info('Rollbacked migration file', {
                  name: migrationName,
                });
              }
            }
          }
        }
        // store new state to take into account files just processed
        loadedState = JSON.parse(JSON.stringify(set));
        fn();
      } catch (error) {
        logApp.error('Error saving state', error);
        fn(error);
      }
    },

    lock: async () => {
      try {
        // Try to create lock - fails if exists
        await esClient.create({
          index: MIGRATION_LOCK_INDEX,
          id: LOCK_DOC_ID,
          document: lockDoc,
          refresh: true,
        });
        return true;
      } catch (error) {
        if (error.statusCode === 409) {
          logApp.error('ERROR: Another migration is already running!');
          return false;
        }
        throw error;
      }
    },

    unlock: async () => {
      await esClient
        .delete({
          index: MIGRATION_LOCK_INDEX,
          id: LOCK_DOC_ID,
        })
        .catch((error) => {
          if (error.statusCode === 404) {
            logApp.warn('Warning: Deleting migration lock but lock not found');
          } else {
            logApp.error('Error Deleting migration lock', error);
          }
        });
    },
  };
}

export const esStateStorage = createEsStateStorage();
