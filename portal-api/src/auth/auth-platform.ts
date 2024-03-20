import passport from './providers.js';
import { setCookieError } from '../utils/set-cookies.util.js';
import bodyParser from 'body-parser';
import { authenticateUser } from '../domain/user.js';

export const initAuthPlatform = async (app) => {
  app.get(`/auth/:provider`, (req, res, next) => {
    try {
      const { provider } = req.params;
      // const strategy = passport._strategy(provider);
      req.session.referer = req.get('Referrer');
      passport.authenticate(provider, {}, (err) => {
        setCookieError(res, err?.message);
        next(err);
      })(req, res, next);
    } catch (e) {
      setCookieError(res, e?.message);
      next(e);
    }
  });

  const urlencodedParser = bodyParser.urlencoded({ extended: true });
  app.all(`/auth/:provider/callback`, urlencodedParser, async (req, res, next) => {
    const { provider } = req.params;

    const referer = req.session.referer;
    const callbackLogin = () => new Promise((accept, reject) => {
      passport.authenticate(provider, {}, (err, user) => {
        if (err || !user) {
          reject(err);
        } else {
          accept(user);
        }
      })(req, res, next);
    });
    try {
      const logged = await callbackLogin();
      await authenticateUser(req, logged, provider);
    } catch (err) {
      console.error(err, { provider });
      setCookieError(res, 'Invalid authentication, please ask your administrator');
    } finally {
      res.redirect(referer ?? '/');
    }
  });

};
