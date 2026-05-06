import config from 'config';
import { discovery, fetchUserInfo, type ClientMetadata } from 'openid-client';
import {
  Strategy as OpenIDStrategy,
  type StrategyOptionsWithRequest,
} from 'openid-client/passport';
import { PassportStatic } from 'passport';
import { logApp } from '../../../../utils/app-logger.util';
import { loadRolePortalsBySSOGroups } from '../../../role-portal/role-portal.domain';
import { providerLoginHandler } from '../login-handle';
import { extractRole } from '../mapping-roles';

export const addOIDCStrategy = async (
  passport: PassportStatic
): Promise<void> => {
  logApp.debug('addOIDCStrategy');
  const AUTH_SSO = 'SSO';
  const STRATEGY_OPENID = 'OpenIDConnectStrategy';
  const providers = [];

  const oidcConfig = getOidcConfig();

  const providerRef = 'oidc';
  try {
    const oidcConfiguration = await discovery(
      new URL(oidcConfig.issuer),
      oidcConfig.client_id,
      oidcConfig.client_secret
    );

    // region scopes generation
    const openIdScopes = ['openid', 'email', 'profile'];
    // endregion
    const options: StrategyOptionsWithRequest = {
      config: oidcConfiguration,
      passReqToCallback: true,
      scope: openIdScopes.join(' '),
      callbackURL: oidcConfig.redirect_uris?.[0],
    };

    const openIDStrategy = new OpenIDStrategy(
      options,
      async (_req, tokens, done) => {
        const userinfo = await fetchUserInfo(
          oidcConfiguration,
          tokens.access_token,
          tokens.claims().sub
        );

        const extractedRoles = extractRole(
          userinfo['https://xtm-hub-development/roles'] as string[]
        );
        const loadedRolesFromSSOGroup = await loadRolePortalsBySSOGroups(
          userinfo['https://xtm-hub-development/groups'] as string[]
        );

        const rolePortal = loadedRolesFromSSOGroup.roles ?? [];

        const roles = [...new Set([...extractedRoles, ...rolePortal])];
        const {
          email,
          nickname: first_name,
          family_name,
          given_name,
          picture,
        } = userinfo;
        await providerLoginHandler(
          {
            email,
            first_name: given_name ?? first_name,
            last_name: family_name,
            roles,
            picture,
          },
          done
        );
        logApp.info('[OPENID] Successfully logged', { userinfo });

        done(null, tokens.claims());
      }
    );

    passport.use(providerRef, openIDStrategy);

    passport.serializeUser(function (user, done) {
      done(null, user);
    });
    passport.deserializeUser(function (user, done) {
      done(null, user);
    });
    providers.push({
      name: 'keycloak-express',
      type: AUTH_SSO,
      STRATEGY_OPENID,
      provider: providerRef,
    });
  } catch (err) {
    logApp.error('Error initializing authentication provider', {
      cause: err,
      provider: providerRef,
    });
  }
};

export const getOidcConfig = () => {
  const oidcConfigFromLocal = config.get('oidc_provider') as ClientMetadata & {
    issuer: string;
  };
  const oidcConfigFromCi = {
    issuer: process.env.OIDC_ISSUER,
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: process.env.OIDC_REDIRECT_URIS?.split(','),
  };

  return process.env.OIDC_ISSUER ? oidcConfigFromCi : oidcConfigFromLocal;
};
