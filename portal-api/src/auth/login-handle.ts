import { loginFromProvider } from '../domain/user.js';

export const providerLoginHandler = (userInfo, done) => {
  loginFromProvider(userInfo)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
};
