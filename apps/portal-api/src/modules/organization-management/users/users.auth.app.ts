import { MutationLoginArgs } from '../../../__generated__/resolvers-types';
import { PORTAL_COOKIE_NAME } from '../../../index';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { validatePassword } from '../../../security/utils/user';
import { loadUserBy, updateUserAtLogin } from './users.domain';

const validPassword = (user: UserLoadUserBy, password: string): boolean => {
  return validatePassword(user.salt, password, user.password);
};

export const UsersAuthApp = {
  login: async (
    context: PortalContext,
    { email, password }: MutationLoginArgs
  ) => {
    const { req } = context;
    const loggedUser = await loadUserBy({ email });
    if (loggedUser && validPassword(loggedUser, password)) {
      req.session.user = await updateUserAtLogin(loggedUser);

      return loggedUser;
    }

    return undefined;
  },

  logout: async ({ user, req, res }: PortalContext): Promise<string> => {
    return new Promise((resolve) => {
      res.clearCookie(PORTAL_COOKIE_NAME);
      req.session.destroy(() => {
        resolve(user ? user.id : 'anonymous');
      });
    });
  },
};
