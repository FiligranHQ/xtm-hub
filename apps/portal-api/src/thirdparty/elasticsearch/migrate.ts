import { load, Migration, MigrationSet } from 'migrate';
import { logApp } from '../../utils/app-logger.util';
import { esStateStorage } from './migration-store';
import { MIGRATION_DIRECTORY, MigrationCommandType } from './migration.const';

function loadMigrations(migrationsDirectory: string): Promise<MigrationSet> {
  return new Promise((resolve, reject) => {
    load(
      {
        stateStore: esStateStorage,
        migrationsDirectory: migrationsDirectory,
      },
      function (err, set) {
        if (err) reject(err);
        else resolve(set);
      }
    );
  });
}

export async function runESMigrations({
  command = MigrationCommandType.UP,
  migrationsDirectory = MIGRATION_DIRECTORY,
  migrationName,
}: {
  command?: MigrationCommandType;
  migrationsDirectory?: string;
  migrationName?: string;
} = {}) {
  logApp.info('[ES migration] migration started');
  if (!(await esStateStorage.lock())) {
    throw new Error('[ES migration] Migration already on going');
  }
  try {
    const set = await loadMigrations(migrationsDirectory);
    if (command === MigrationCommandType.UP) {
      await runMigrationsUp(set);
    } else if (command === MigrationCommandType.DOWN) {
      await runMigrationsDown(set, migrationName);
    }
  } finally {
    await esStateStorage.unlock();
    logApp.info('[ES migration] migration completed');
  }
}

function runMigrationsUp(set: MigrationSet): Promise<void> {
  return new Promise((resolve, reject) => {
    set.up((error: Error) => {
      if (error) {
        logApp.error('[ES migration] Up migration error:', { error: error });
        reject(error);
      } else resolve();
    });
  });
}

function runMigrationsDown(
  set: MigrationSet,
  migrationName?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let migrationToDown = migrationName;
    if (!migrationName) {
      // Process only the last migration file
      const lastMigration = set.migrations
        .filter((m: Migration) => m.timestamp) // Only completed migrations
        .pop(); // Get the last one
      if (!lastMigration) {
        logApp.info('[ES migration] No migrations to rollback');
        return resolve();
      }
      migrationToDown = lastMigration.title;
    }
    set.down(migrationToDown, (error: Error) => {
      if (error) {
        logApp.error('[ES migration] Down migration error:', { error: error });
        reject(error);
      } else resolve();
    });
  });
}
