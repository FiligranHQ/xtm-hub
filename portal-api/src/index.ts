import expressSession, { SessionData } from 'express-session';
import { ApolloServer } from '@apollo/server';
import { createServer } from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import pkg from 'body-parser';
import express from 'express';
import createSchema from './server/graphl-schema';
import { dbMigration } from '../knexfile';
import portalConfig from './config';
import { printSchema } from 'graphql/utilities/index.js';
import fs from 'node:fs';
import platformInit from './server/initialize';
import { initAuthPlatform } from './auth/auth-platform';
import { User } from './model/user';
import { PortalContext } from './model/portal-context';
import { awxEndpoint } from './managers/awx/awx-endpoint';
import { createHandler } from 'graphql-sse/lib/use/express';

const { json } = pkg;

// region GraphQL server initialization
export const PORTAL_COOKIE_NAME = 'cloud-portal';
export const PORTAL_COOKIE_SECRET = 'cloud-portal-cookie-key';
const PORTAL_GRAPHQL_PATH = '/graphql-api';
const PORTAL_WEBSOCKET_PATH = '/graphql-sse';


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
app.use(express.json());
app.use(sessionMiddleware);

/*
Encountered an unexpected behavior within the express-session middleware.
The chunk parameter passed to the res.end() function is sometimes a function
instead of the expected data.
This function, when executed, returns undefined.
To prevent potential issues, calling the function before unsubscribing
from the GraphQL SSE stream ensures
that the correct data is obtained and sent as the event.
 */
app.use(function(req, res, next) {
  const originalEnd = res.end;
  // @ts-ignore
  res.end = function(chunk, encoding) {
    if (typeof chunk === 'function') {
      chunk();
    }
    return originalEnd(chunk, encoding);
  };
  next();
});
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

await initAuthPlatform(app);
awxEndpoint(app);

// Ensure migrate the schema
await dbMigration.migrate();
await platformInit();
console.log('[Migration] Database version is now ' + await dbMigration.version());
// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: portalConfig.port }, resolve));
console.log(`🚀 Server ready at http://localhost:` + portalConfig.port);
