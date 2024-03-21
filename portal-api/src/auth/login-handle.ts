import { loginFromProvider } from '../domain/user';

export const providerLoginHandler = (userInfo, done) => {
  loginFromProvider(userInfo)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
};
