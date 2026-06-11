import bodyParser from 'body-parser';
import { Express, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { requestContext } from '../../../context/request.context';
import { UserInfo } from '../../../model/user';
import { SYSTEM_USER_CONTEXT } from '../../../portal.const';
import { AppLogsCategory, logApp } from '../../../utils/app-logger.util';
import {
  getErrorMessage,
  toError,
} from '../../../utils/error/error-guard.util';
import { resolveSessionReferer } from '../../../utils/extract-referer.util';
import { setCookieError } from '../../../utils/set-cookies.util';
import { authenticateUser } from './auth-user';
import { initProviders } from './provider/providers';

const authProviderRateLimiter = rateLimit({
  windowMs: 180 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const initAuthPlatform = async (app: Express) => {
  logApp.debug('initAuthPlatform');
  const passport = await initProviders();
  app.get(
    `/auth/:provider`,
    authProviderRateLimiter,
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const providerParam = req.params.provider;
        const provider = Array.isArray(providerParam)
          ? providerParam[0]
          : providerParam;
        if (!provider) {
          setCookieError(res, 'Missing authentication provider');
          res.redirect('/');
          return;
        }
        const redirect = req.query.redirect;
        // Referer header is attacker-controlled — not trusted as redirect destination
        req.session.referer =
          typeof redirect === 'string'
            ? resolveSessionReferer(redirect)
            : undefined;
        requestContext.set(SYSTEM_USER_CONTEXT);
        passport.authenticate(provider, {}, (err: Error | null) => {
          setCookieError(res, err?.message);
          next(err);
        })(req, res, next);
      } catch (e) {
        setCookieError(res, getErrorMessage(e));
        next(e);
      }
    }
  );

  const urlencodedParser = bodyParser.urlencoded({ extended: true });
  app.all(
    `/auth/:provider/callback`,
    urlencodedParser,
    async (req: Request, res: Response, next: NextFunction) => {
      const providerParam = req.params.provider;
      const provider = Array.isArray(providerParam)
        ? providerParam[0]
        : providerParam;
      if (!provider) {
        setCookieError(res, 'Missing authentication provider');
        res.redirect('/');
        return;
      }
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
        const normalizedError = toError(err);
        logApp.error(normalizedError, { provider });
        if (normalizedError.message === 'User not provided' && referer) {
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
