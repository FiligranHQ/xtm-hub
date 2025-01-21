import { UserInfo } from '../model/user';
import { ErrorType } from '../utils/error.util';
import { loginFromProvider } from './auth-user';

export const providerLoginHandler = async (userInfo: UserInfo, done) => {
  await loginFromProvider(userInfo)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      if (err.name === ErrorType.ForbiddenAccess) {
        done(null, null);
      }
      done(err);
    });
};
