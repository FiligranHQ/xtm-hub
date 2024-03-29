import { loginFromProvider } from './auth-user';
import { UserInfo } from '../model/user';

export const providerLoginHandler = async (userInfo: UserInfo, done) => {
  await loginFromProvider(userInfo)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
};
