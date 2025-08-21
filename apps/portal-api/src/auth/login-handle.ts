import { ErrorType } from '@xtm-hub/error';
import { AppLogsCategory, logApp } from '@xtm-hub/logger';
import { UserInfo } from '../model/user';
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
      logApp.error(err, {}, AppLogsCategory.LOGIN_PROVIDER);
      done(err);
    });
};
