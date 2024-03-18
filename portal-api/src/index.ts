import expressSession, { SessionData } from 'express-session';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { createServer } from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import pkg from 'body-parser';
import bodyParser from 'body-parser';
import express from 'express';
import { createHandler } from 'graphql-sse/lib/use/express';
import createSchema from './server/graphl-schema.js';
import { dbMigration } from '../knexfile.js';
import portalConfig from './config.js';
import { printSchema } from 'graphql/utilities/index.js';
import fs from 'node:fs';
import platformInit from './server/initialize.js';
import { Restriction } from './__generated__/resolvers-types.js';
import passport from './config/providers.js';
import { setCookieError } from './utils/set-cookies.util.js';
import { authenticateUser } from './domain/user.js';
/* eslint-disable @typescript-eslint/unbound-method */
const { json } = pkg;

// region GraphQL server initialization
export const PORTAL_COOKIE_NAME = 'cloud-portal';
export const PORTAL_COOKIE_SECRET = 'cloud-portal-cookie-key';
const PORTAL_GRAPHQL_PATH = '/graphql-api';
const PORTAL_WEBSOCKET_PATH = '/graphql-sse';

export interface User {
  id: string;
  email: string;
  capabilities: { id: string, name: Restriction }[];
  organization_id: string;
  organization: { id: string, name?: string };
}

export interface PortalContext {
  user: User;
  referer?: string;
  req: express.Request;
  res: express.Response;
}

const app = express();
const sessionMiddleware = expressSession({
  name: PORTAL_COOKIE_NAME,
  secret: PORTAL_COOKIE_SECRET,
  saveUninitialized: true,
  proxy: true,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    // maxAge: 60 * 60 * 1000 // 1 hour
  },
});
app.use(cookieParser());
app.use(sessionMiddleware);

const httpServer = createServer(app);
const schema = createSchema();

if (process.env.NODE_ENV !== 'production') {
  const printedSchema = printSchema(schema);
  fs.writeFileSync('../portal-front/schema.graphql', printedSchema);
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
// const drainPlugin = {
//     async serverWillStart() {
//         return Promise.resolve({
//             async drainServer() {
//                 await serverCleanup.dispose();
//             },
//         });
//     },
// }
const server = new ApolloServer<PortalContext>({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ includeCookies: true, variables: {} }),
  ],
});

// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
await server.start();

// Specify the path where we'd like to mount our server
declare module 'express-session' {
  // noinspection JSUnusedGlobalSymbols
  interface SessionData {
    user: User;
    referer: string;
  }
}

const middlewareExpress = expressMiddleware(server, {
  context: async ({ req, res }) => {
    const { user } = req.session;
    // if (!user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
    // TODO Add build session from request authorization
    return { user, req, res };
  },
});
const handler = createHandler({
  schema,
  context: async (_req) => {
    const session = await new Promise((resolve) => {
      sessionMiddleware(_req.raw, {} as express.Response, () => resolve(_req.raw.session));
    });
    const { user } = session as SessionData;
    // if (!user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
    // TODO Add build session from request authorization
    return { user, req: _req };
  },
});
app.use(PORTAL_WEBSOCKET_PATH, cors<cors.CorsRequest>(), json(), handler);
app.use(PORTAL_GRAPHQL_PATH, sessionMiddleware, cors<cors.CorsRequest>(), json(), middlewareExpress);
// endregion


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

// Ensure migrate the schema
await dbMigration.migrate();
await platformInit();
console.log('[Migration] Database version is now ' + await dbMigration.version());

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: portalConfig.port }, resolve));
console.log(`🚀 Server ready at http://localhost:` + portalConfig.port);
