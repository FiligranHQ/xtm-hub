import type { PgBoss } from 'pg-boss';
import { logApp } from '../../utils/app-logger.util';
import { HubspotWorkers } from './hubspot.workers';

export const PgBossWorkers = {
  startAll: async (boss: PgBoss): Promise<void> => {
    await HubspotWorkers.start(boss);
    logApp.info('[PgBoss] All workers started');
  },
};
