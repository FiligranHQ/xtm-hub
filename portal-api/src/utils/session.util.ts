import { memoryStore } from '../index';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from '../model/user';
import { logApp } from './app-logger.util';
import { UnknownError } from './error.util';

export const updateUserSession = (user: UserWithOrganizationsAndRole) => {
  const storeInstance = memoryStore;

  storeInstance.all((err, sessions) => {
    const sessionIds = Object.keys(sessions).filter((id) => {
      const session = sessions[id];
      return session.user?.id === user.id;
    });
    if (sessionIds.length > 0) {
      sessionIds.forEach((sessionId) => {
        const sessionToUpdate = sessions[sessionId];
        sessionToUpdate.user = user as UserLoadUserBy;
        storeInstance.set(sessionId, sessionToUpdate, (error) => {
          logApp.info('USER_SESSION_UPDATED');
          if (error) {
            throw UnknownError('EDIT_USER_SESSION_ERROR', {
              detail: error,
            });
          }
        });
      });
    }
  });
};
