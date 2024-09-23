import { loginFromProvider } from './auth-user';
import { UserInfo } from '../model/user';
import { FORBIDDEN_ACCESS } from '../utils/error.util';

export const providerLoginHandler = async (userInfo: UserInfo, done) => {
  await loginFromProvider(userInfo)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      if (err.name === FORBIDDEN_ACCESS) {
        done(null, null);
      }
      done(err);
    });
};
