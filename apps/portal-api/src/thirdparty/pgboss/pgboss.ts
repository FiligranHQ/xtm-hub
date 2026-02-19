import { PgBoss } from 'pg-boss';
import portalConfig from '../../config';
import { logApp } from '../../utils/app-logger.util';
import { PgBossMetrics } from './pgboss.metrics';
import { PgBossWorkers } from './workers';

const PGBOSS_SCHEMA = 'pgboss';

let boss: PgBoss | null = null;

export const PgBossApp = {
  get: (): PgBoss => {
    if (!boss) {
      throw new Error(
        'PgBoss has not been started. Call pgBossApp.start() first.'
      );
    }
    return boss;
  },

  start: async (): Promise<PgBoss> => {
    const { host, port, user, password, database } = portalConfig.database;

    boss = new PgBoss({
      host,
      port,
      user,
      password,
      database,
      schema: PGBOSS_SCHEMA,
    });

    boss.on('error', (error) => {
      logApp.error('PgBoss error', { error });
    });

    boss.on('warning', (warning) => {
      logApp.warn(`PgBoss warning: ${warning.message}`);
    });

    await boss.start();

    logApp.info(
      `[PgBoss] Started (schema: ${PGBOSS_SCHEMA}, database: ${database})`
    );

    await PgBossWorkers.startAll(boss);

    PgBossMetrics.start(boss);

    return boss;
  },

  stop: async (): Promise<void> => {
    if (boss) {
      PgBossMetrics.stop();
      await boss.stop({ graceful: true, timeout: 10_000 });
      boss = null;
      logApp.info('[PgBoss] Stopped');
    }
  },
};
