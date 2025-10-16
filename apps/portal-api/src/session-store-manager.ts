import { MemoryStore, SessionData } from 'express-session';
import portalConfig from './config';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from './model/user';
import { PostgreSQLSessionStore } from './stores/postgresql-session-store';
import { logApp } from './utils/app-logger.util';
import { UnknownErrorCode } from './utils/error/error.code';

let memoryStore: MemoryStore | undefined = undefined;
let postgresStore: PostgreSQLSessionStore | undefined = undefined;

/**
 * Get Memory Store instance
 */
const getMemoryStoreInstance = () => {
  if (!memoryStore) {
    memoryStore = new MemoryStore({});
  }
  return memoryStore;
};

/**
 * Get PostgreSQL Store instance
 */
const getPostgreSQLStoreInstance = () => {
  if (!postgresStore) {
    postgresStore = new PostgreSQLSessionStore();
  }
  return postgresStore;
};

/**
 * Get session store instance based on configuration
 */
export const getSessionStoreInstance = () => {
  const storeType = portalConfig.session_store.type;

  switch (storeType) {
    case 'postgresql':
      logApp.info('Using PostgreSQL Session Store');
      return getPostgreSQLStoreInstance();
    case 'memory':
      logApp.info('Using Memory Session Store');
      return getMemoryStoreInstance();
    default:
      logApp.warn(
        `Unknown session store type: ${storeType}, defaulting to PostgreSQL`
      );
      return getPostgreSQLStoreInstance();
  }
};

const getSessionsForUser = (
  sessions: Record<string, SessionData> | null | undefined,
  userId: string
): string[] => {
  if (!sessions) return [];

  return Object.keys(sessions).filter((id) => {
    const session = sessions[id] as SessionData & { user?: UserLoadUserBy };
    return session.user?.id === userId;
  });
};

/**
 * Update user session data across all active sessions
 * This function works with both PostgreSQL and Memory stores
 */
export const updateUserSession = (user: UserWithOrganizationsAndRole) => {
  const storeInstance = getSessionStoreInstance();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeInstance.all((err: any, sessions: any) => {
    if (err) {
      logApp.error('Error retrieving sessions for user update:', {
        error: err,
      });
      return;
    }

    if (!sessions) {
      logApp.debug('No sessions found for user update');
      return;
    }

    // Handle sessions as object
    const typedSessions = sessions as Record<string, SessionData>;
    const sessionIds = getSessionsForUser(typedSessions, user.id);

    if (sessionIds.length > 0) {
      logApp.info(`Updating ${sessionIds.length} sessions for user ${user.id}`);

      sessionIds.forEach((sessionId) => {
        const sessionToUpdate = typedSessions[sessionId] as SessionData & {
          user?: UserLoadUserBy;
        };
        sessionToUpdate.user = user as UserLoadUserBy;

        storeInstance.set(
          sessionId,
          sessionToUpdate as SessionData,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error?: any) => {
            if (error) {
              logApp.error(`Error updating session ${sessionId}:`, { error });
              throw new Error(UnknownErrorCode.EditUserSessionError);
            }
            logApp.debug(`USER_SESSION_UPDATED for session ${sessionId}`);
          }
        );
      });
    } else {
      logApp.debug(`No active sessions found for user ${user.id}`);
    }
  });
};
