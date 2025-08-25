import {
  MigrationCommandType,
  runESMigrations,
} from './src/thirdparty/elasticsearch/migrate';
import { logApp } from './src/utils/app-logger.util';

const MIGRATION_DIRECTORY = './src/esmigrations';

function isMigrationCommand(value: string): value is MigrationCommandType {
  return Object.values(MigrationCommandType).includes(
    value as MigrationCommandType
  );
}

// Parse command line arguments
const [, , command, migrationName] = process.argv;
if (!command || !isMigrationCommand(command)) {
  const validCommands = Object.values(MigrationCommandType).join(', ');
  logApp.error(
    `[ES migration] Invalid migration command. It must be one of ${validCommands}`
  );
  process.exit(1);
}

runESMigrations({
  command,
  migrationName,
  migrationsDirectory: MIGRATION_DIRECTORY,
})
  .then(() => {
    logApp.info('[ES migration] migration completed');
  })
  .catch((err) => {
    logApp.error('[ES migration] migration failed:', err);
  });
