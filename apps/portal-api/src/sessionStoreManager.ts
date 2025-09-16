import { MemoryStore } from 'express-session';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from './model/user';
import { logApp } from './utils/app-logger.util';
import { UnknownErrorCode } from './utils/error/error.code';

let memoryStore = undefined;

export const getSessionStoreInstance = () => {
  if (!memoryStore) {
    memoryStore = new MemoryStore({});
  }
  return memoryStore;
};

const getSessionsForUser = (sessions, userId) => {
  return Object.keys(sessions).filter((id) => {
    const session = sessions[id];
    return session.user?.id === userId;
  });
};

export const updateUserSession = (user: UserWithOrganizationsAndRole) => {
  const storeInstance = getSessionStoreInstance();

  storeInstance.all((err, sessions) => {
    const sessionIds = getSessionsForUser(sessions, user.id);
    if (sessionIds.length > 0) {
      sessionIds.forEach((sessionId) => {
        const sessionToUpdate = sessions[sessionId];
        sessionToUpdate.user = user as UserLoadUserBy;
        storeInstance.set(sessionId, sessionToUpdate, (error) => {
          logApp.info('USER_SESSION_UPDATED');
          if (error) {
            throw new Error(UnknownErrorCode.EditUserSessionError);
          }
        });
      });
    }
  });
};
