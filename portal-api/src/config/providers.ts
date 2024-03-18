import passport from 'passport/lib/index.js';
import { custom as OpenIDCustom, Issuer as OpenIDIssuer, Strategy as OpenIDStrategy } from 'openid-client';
import { providerLoginHandler } from './login-handle.js';

const AUTH_SSO = 'SSO';
const STRATEGY_OPENID = 'OpenIDConnectStrategy';
const providers = [];

const config = {
  issuer: 'http://localhost:8080/realms/keycloak-express',
  client_id: 'keycloak-express',
  client_secret: 'long_secret-here',
  redirect_uris: ['http://localhost:3001/auth/oidc/callback'],
  logout_callback_url: ['http://localhost:3001/oidc/callback'],
  response_types: ['code'],
};
const providerRef = 'oidc';
// Here we use directly the config and not the mapped one.
// All config of openid lib use snake case.
const openIdClient = undefined;
OpenIDCustom.setHttpOptionsDefaults({ timeout: 0, agent: openIdClient });
OpenIDIssuer.discover(config.issuer).then((issuer) => {
  const { Client } = issuer;
  const client = new Client(config);
  // region scopes generation
  const openIdScopes = ['openid', 'email', 'profile'];
  // endregion
  const options = { client, passReqToCallback: true, params: { scope: openIdScopes.join(' ') } };

  const openIDStrategy = new OpenIDStrategy(options, (_, tokenSet, userinfo, done) => {
    console.info('[OPENID] Successfully logged', { userinfo });
    const { email, name, given_name: firstname, family_name: lastname } = userinfo;
    providerLoginHandler({ email, name, firstname, lastname }, done);
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


export default passport;
