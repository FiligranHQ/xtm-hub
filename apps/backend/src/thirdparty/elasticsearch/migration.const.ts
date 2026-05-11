export const MIGRATION_DIRECTORY = './src/es-migrations';

export const MIGRATION_INDEX = 'migrations';
export const MIGRATION_LOCK_INDEX = 'migrations_lock';

export const LOCK_DOC_ID = 'current-lock';

export enum MigrationCommandType {
  UP = 'up',
  DOWN = 'down',
}
