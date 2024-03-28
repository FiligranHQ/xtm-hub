import {
  ClientMetadata,
  custom as OpenIDCustom,
  Issuer as OpenIDIssuer,
  Strategy as OpenIDStrategy,
} from 'openid-client';
import { providerLoginHandler } from '../login-handle';
import config from 'config';
import { jwtDecode } from 'jwt-decode';
import { getNestedPropertyValue } from '../../utils/utils';

export const addOIDCStrategy = (passport) => {
  const AUTH_SSO = 'SSO';
  const STRATEGY_OPENID = 'OpenIDConnectStrategy';
  const providers = [];

  const oidcConfig = config.get('oidc_provider') as ClientMetadata&{ issuer: string };
  const providerRef = 'oidc';
// Here we use directly the config and not the mapped one.
// All config of openid lib use snake case.
  const openIdClient = undefined;
  OpenIDCustom.setHttpOptionsDefaults({ timeout: 0, agent: openIdClient });
  OpenIDIssuer.discover(oidcConfig.issuer).then((issuer) => {
    const { Client } = issuer;
    const client = new Client(oidcConfig);
    // region scopes generation
    const openIdScopes = ['openid', 'email', 'profile'];
    // endregion
    const options = { client, passReqToCallback: true, params: { scope: openIdScopes.join(' ') } };

    console.log('OIDC Strategy');
    const openIDStrategy = new OpenIDStrategy(options, async (_, tokenSet, userinfo, done) => {
      const decodedUser = config.get('user_management.read_userinfo') ? userinfo : jwtDecode(tokenSet.access_token);
      // const addRoleUserInLocal = {
      //   ...decodedUser,
      //   resource_access: {
      //     'scred-portal-dev': {
      //       roles: [
      //         'admin',
      //       ],
      //     },
      //   },
      // };
      const roles = getNestedPropertyValue(decodedUser, config.get('user_management.roles_path') as string);

      console.info('[OPENID] Successfully logged', { decodedUser });
      console.info('[OPENID] User role', { roles });
      const { email, name, given_name: first_name, family_name: last_name } = userinfo;
      await providerLoginHandler({ email, first_name, last_name, roles }, done);
      done(null, tokenSet.claims());
    });
    // openIDStrategy.logout = (_, callback) => {
    //   const isSpecificUri = isNotEmptyField(config.logout_callback_url);
    //   const endpointUri = issuer.end_session_endpoint ? issuer.end_session_endpoint : `${config.issuer}/oidc/logout`;
    //   if (isSpecificUri) {
    //     const logoutUri = `${endpointUri}?post_logout_redirect_uri=${config.logout_callback_url}`;
    //     callback(null, logoutUri);
    //   } else {
    //     callback(null, endpointUri);
    //   }
    // };
    passport.use(providerRef, openIDStrategy);
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    passport.deserializeUser(function(user, done) {
      done(null, user);
    });
    providers.push({ name: 'keycloak-express', type: AUTH_SSO, STRATEGY_OPENID, provider: providerRef });
  }).catch((err) => {
    console.error('Error initializing authentication provider', { cause: err, provider: providerRef });
  });
};



