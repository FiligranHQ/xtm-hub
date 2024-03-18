import { loginFromProvider } from '../domain/user.js';

export const providerLoginHandler = (userInfo, done, opts = {}) => {
  loginFromProvider(userInfo, opts)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
};
