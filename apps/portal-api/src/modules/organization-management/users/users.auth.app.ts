import config from 'config';
import { MutationLoginArgs } from '../../../__generated__/resolvers-types';
import portalConfig from '../../../config';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { validatePassword } from '../../../security/util/user';
import { ForbiddenAccess } from '../../../utils/error/error.util';
import { loadUserBy, updateUserAtLogin } from './user-domain/users.domain';

const validPassword = (user: UserLoadUserBy, password: string): boolean => {
  return validatePassword(user.salt, password, user.password);
};

const isLocalAuthEnabled = (): boolean => {
  const loginSettings =
    config.get<{ provider: string }[]>('login_settings') ?? [];
  return loginSettings.some((entry) => entry.provider === 'local');
};

export const UsersAuthApp = {
  login: async (
    context: PortalContext,
    { email, password }: MutationLoginArgs
  ) => {
    if (!isLocalAuthEnabled()) {
      throw ForbiddenAccess('Local authentication is not enabled');
    }

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
      res.clearCookie(portalConfig.session.name);
      req.session.destroy(() => {
        resolve(user ? user.id : 'anonymous');
      });
    });
  },
};
