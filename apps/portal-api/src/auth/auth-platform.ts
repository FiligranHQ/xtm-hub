import bodyParser from 'body-parser';
import { requestContext } from '../context/request.context';
import { UserInfo } from '../model/user';
import { SYSTEM_USER_CONTEXT } from '../portal.const';
import { AppLogsCategory, logApp } from '../utils/app-logger.util';
import { resolveSessionReferer } from '../utils/extract-referer.util';
import { setCookieError } from '../utils/set-cookies.util';
import { authenticateUser } from './auth-user';
import { initProviders } from './providers/providers';

export const initAuthPlatform = async (app) => {
  logApp.debug('initAuthPlatform');
  const passport = await initProviders();
  app.get(`/auth/:provider`, (req, res, next) => {
    try {
      const { provider } = req.params;
      const redirect = req.query.redirect;
      // Referer header is attacker-controlled — not trusted as redirect destination
      req.session.referer =
        typeof redirect === 'string'
          ? resolveSessionReferer(redirect)
          : undefined;
      requestContext.set(SYSTEM_USER_CONTEXT);
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
        requestContext.set(SYSTEM_USER_CONTEXT);
        const user: UserInfo = await new Promise((resolve, reject) => {
          passport.authenticate(
            provider,
            {},
            (err: Error, user: UserInfo | false | null) => {
              if (!user) {
                logApp.error(err, {}, AppLogsCategory.LOGIN_PROVIDER);
                reject(new Error('User not provided'));
              } else if (err) {
                reject(err || new Error('Invalid authentication'));
              } else {
                resolve(user);
              }
            }
          )(req, res, next);
        });

        const logged = await authenticateUser(req, res, user);
        res.redirect(logged ? (referer ?? '/app') : '/');
      } catch (err) {
        logApp.error(err, { provider });
        if (err.message === 'User not provided' && referer) {
          referer = `${referer}${referer.includes('?') ? '&' : '?'}error=not-provided`;
        }

        setCookieError(
          res,
          'Invalid authentication, please ask your administrator'
        );
        res.redirect(referer ?? '/');
      }
    }
  );
};
