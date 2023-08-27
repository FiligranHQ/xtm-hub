import cookieSession from 'cookie-session';
import { ApolloServer } from '@apollo/server';
import { createServer } from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import pkg from 'body-parser';
/* eslint-disable @typescript-eslint/unbound-method */
const { json } = pkg;
import express from 'express';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import createSchema from "./server/graphl-schema.js";
import { database } from "../knexfile.js";
// import { GraphQLError } from "graphql/error/index.js";
import CookieSessionObject = CookieSessionInterfaces.CookieSessionObject;

// region GraphQL server initialization
const PORTAL_GRAPHQL_PATH = '/graphql';

interface User {
    id: string
    email: string
}

export interface PortalContext {
    user: User
    session: CookieSessionObject
}

const app = express();
app.use(cookieSession({
    name: 'cloud-portal',
    keys: ['cloud-portal-cookie-key'],
    maxAge: 60 * 60 * 1000 // 1 hour
}))

const httpServer = createServer(app);
const schema = createSchema();

// Creating the WebSocket server
const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: PORTAL_GRAPHQL_PATH,
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const drainPlugin = {
    async serverWillStart() {
        return Promise.resolve({
            async drainServer() {
                await serverCleanup.dispose();
            },
        });
    },
}
const server = new ApolloServer<PortalContext>({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        drainPlugin,
        ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })
    ]
});

// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
await server.start();

// Specify the path where we'd like to mount our server
declare module 'express-session' {
    // noinspection JSUnusedGlobalSymbols
    interface SessionData {
        user: User;
    }
}

const middlewareExpress = expressMiddleware(server, {
    context: async ({ req }) => {
        const { user } = req.session;
        // if (!user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
        // TODO Add build session from request authorization
        return { user, session: req.session }
    }
});
app.use(PORTAL_GRAPHQL_PATH, cors<cors.CorsRequest>(), json(), middlewareExpress);
// endregion

// Ensure migrate the schema
await database.migrate.latest();
console.log('[Migration] Database version is now ' + await database.migrate.currentVersion());

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);