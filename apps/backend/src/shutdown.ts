import { Server } from 'http';
import { logApp } from './utils/app-logger.util';

const SHUTDOWN_TIMEOUT_MS = 25_000;

interface ShutdownHook {
  name: string;
  fn: () => Promise<void>;
}

const hooks: ShutdownHook[] = [];
let isShuttingDown = false;

export const registerShutdownHook = (name: string, fn: ShutdownHook['fn']) => {
  hooks.push({ name, fn });
};

const executeShutdown = async (reason: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logApp.info(
    `Shutdown initiated (${reason}), running ${hooks.length} hooks...`
  );

  const timeout = setTimeout(() => {
    logApp.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  for (const hook of hooks) {
    try {
      logApp.info(`Shutdown: ${hook.name}...`);
      await hook.fn();
      logApp.info(`Shutdown: ${hook.name} completed`);
    } catch (error) {
      logApp.error(`Shutdown hook failed: ${hook.name}`, { error });
    }
  }

  clearTimeout(timeout);
  logApp.info('All shutdown hooks completed, exiting');
  process.exit(0);
};

export const initShutdown = (httpServer: Server) => {
  registerShutdownHook('http-server', () => {
    return new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  process.once('SIGTERM', () => void executeShutdown('SIGTERM'));
  process.once('SIGINT', () => void executeShutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logApp.error('Uncaught exception, initiating shutdown', { error });
    void executeShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logApp.error('Unhandled rejection, initiating shutdown', {
      error: reason instanceof Error ? reason : new Error(String(reason)),
    });
    void executeShutdown('unhandledRejection');
  });
};
