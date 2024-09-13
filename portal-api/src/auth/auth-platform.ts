import passport from './providers/providers';
import { setCookieError } from '../utils/set-cookies.util';
import bodyParser from 'body-parser';
import { authenticateUser } from './auth-user';

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
  app.all(
    `/auth/:provider/callback`,
    urlencodedParser,
    async (req, res, next) => {
      const { provider } = req.params;
      let referer = req.session.referer;
      try {
        const user = await new Promise((resolve, reject) => {
          passport.authenticate(provider, {}, (err, user) => {
            if(!user) {
              reject(new Error('User not provided'))
            }
            if (err) {
              reject(err || new Error('Invalid authentication'));
            } else {
              resolve(user);
            }
          })(req, res, next);
        });

        await authenticateUser(req, user);
      } catch (err) {
        console.error(err, { provider });
        if(err.message === 'User not provided') {
          referer = referer+'?data=not-provided'
        }

        setCookieError(
          res,
          'Invalid authentication, please ask your administrator'
        );
      } finally {
        res.redirect(referer ?? '/');
      }
    }
  );
};
