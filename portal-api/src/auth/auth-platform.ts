import bodyParser from 'body-parser';
import { UserInfo } from '../model/user';
import { logApp } from '../utils/app-logger.util';
import { setCookieError } from '../utils/set-cookies.util';
import { authenticateUser } from './auth-user';
import passport from './providers/providers';

export const initAuthPlatform = async (app) => {
  app.get(`/auth/:provider`, (req, res, next) => {
    try {
      const { provider } = req.params;
      req.session.referer = req.query.redirect
        ? atob(req.query.redirect)
        : req.get('Referrer');
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
        const user: UserInfo = await new Promise((resolve, reject) => {
          passport.authenticate(
            provider,
            {},
            (err: unknown, user: UserInfo | false | null) => {
              if (!user) {
                reject(new Error('User not provided'));
              } else if (err) {
                reject(err || new Error('Invalid authentication'));
              } else {
                resolve(user);
              }
            }
          )(req, res, next);
        });

        await authenticateUser(req, res, user);
      } catch (err) {
        logApp.error(err, { provider });
        if (err.message === 'User not provided') {
          referer = referer + '?error=not-provided';
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
