import config from 'config';
import { MutationLoginArgs } from '../../../__generated__/resolvers-types';
import portalConfig from '../../../config';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { validatePassword } from '../../../security/util/user';
import { ForbiddenAccess } from '../../../utils/error/error.util';
import { UserDomain } from './user-domain/user.domain';

const validPassword = (user: UserLoadUserBy, password: string): boolean => {
  return validatePassword(user.salt, password, user.password);
};

const isLocalAuthEnabled = (): boolean => {
  const loginSettings =
    config.get<{ provider: string }[]>('login_settings') ?? [];
  return loginSettings.some((entry) => entry.provider === 'local');
};

export const UserAuthApp = {
  login: async (
    context: PortalContext,
    { email, password }: MutationLoginArgs
  ) => {
    if (!isLocalAuthEnabled()) {
      throw ForbiddenAccess('Local authentication is not enabled');
    }

    const { req, res } = context;
    const loggedUser = await UserDomain.loadUserBy({ email });
    if (loggedUser && validPassword(loggedUser, password)) {
      req.session.user = await UserDomain.updateUserAtLogin(loggedUser);

      res.cookie('NEXT_LOCALE', loggedUser.language);

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
