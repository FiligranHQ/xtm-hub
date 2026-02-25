import portalConfig from '../config';
import { getSessionStoreInstance } from '../session-store-manager';
import { PostgreSQLSessionStore } from '../stores/postgresql-session-store';
import { logApp } from './app-logger.util';

interface SessionCleanupOptions {
  intervalMinutes?: number;
}

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start the automatic session cleanup process
 */
export const startSessionCleanup = (options: SessionCleanupOptions = {}) => {
  // Only start cleanup for PostgreSQL sessions
  if (portalConfig.session_store.type !== 'postgresql') {
    logApp.info('Session cleanup disabled (not using PostgreSQL store)');
    return;
  }

  const {
    intervalMinutes = portalConfig.session_store.cleanup_interval_minutes,
  } = options;

  logApp.info(
    `Starting session cleanup service (interval: ${intervalMinutes} minutes)`
  );

  // Run cleanup immediately on startup
  runCleanup();

  // Schedule periodic cleanup
  cleanupInterval = setInterval(runCleanup, intervalMinutes * 60 * 1000);
};

/**
 * Stop the automatic session cleanup process
 */
export const stopSessionCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logApp.info('Session cleanup service stopped');
  }
};

/**
 * Run session cleanup once
 */
export const runCleanup = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const store = getSessionStoreInstance() as PostgreSQLSessionStore;

      store.cleanup((err: unknown, deletedCount?: number) => {
        if (err) {
          logApp.error('Session cleanup failed:', { error: err });
          reject(err);
          return;
        }

        const count = deletedCount ?? 0;
        logApp.debug(
          `Session cleanup completed: ${count} expired sessions removed`
        );

        resolve(count);
      });
    } catch (error) {
      logApp.error('Session cleanup error:', { error });
      reject(error);
    }
  });
};

/**
 * Manual cleanup trigger (useful for testing or manual maintenance)
 */
export const manualCleanup = async (): Promise<void> => {
  logApp.info('Manual session cleanup triggered');
  try {
    const deletedCount = await runCleanup();
    logApp.info(`Manual cleanup completed: ${deletedCount} sessions removed`);
  } catch (error) {
    logApp.error('Manual cleanup failed:', { error });
    throw error;
  }
};

/**
 * Get cleanup status information
 */
export const getCleanupStatus = () => {
  return {
    isRunning: cleanupInterval !== null,
    intervalMinutes: portalConfig.session_store.cleanup_interval_minutes,
    storeType: portalConfig.session_store.type,
    enabled: portalConfig.session_store.type === 'postgresql',
  };
};
