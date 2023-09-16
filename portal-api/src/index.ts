import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import {ApolloServer} from '@apollo/server';
import {createServer} from 'http';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import pkg from 'body-parser';
/* eslint-disable @typescript-eslint/unbound-method */
const {json} = pkg;
import express from 'express';
import {WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';
import createSchema from "./server/graphl-schema.js";
import {dbMigration} from "../knexfile.js";
import portalConfig from "./config.js";
import {printSchema} from "graphql/utilities/index.js";
import fs from "node:fs";
import platformInit from "./server/initialize.js";

// region GraphQL server initialization
export const PORTAL_COOKIE_NAME = 'cloud-portal';
export const PORTAL_COOKIE_SECRET = 'cloud-portal-cookie-key';
const PORTAL_GRAPHQL_PATH = '/graphql';

interface User {
    id: string
    email: string
    capabilities: {id: string, name: string}[]
    organization: {id: string, name?: string}
}

export interface PortalContext {
    user: User
    req: express.Request
    res: express.Response
}

const app = express();
const sessionMiddleware = expressSession({
    name: PORTAL_COOKIE_NAME,
    secret: PORTAL_COOKIE_SECRET,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        maxAge: 60 * 60 * 1000 // 1 hour
    }
});
app.use(sessionMiddleware)
app.use(cookieParser());

const httpServer = createServer(app);
const schema = createSchema();

// TODO Execute only in dev mode
const printedSchema = printSchema(schema);
fs.writeFileSync('../portal-front/schema.graphql', printedSchema);

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
const serverCleanup = useServer({
    schema,
    context: async (ctx) => {
        const req = ctx.extra.request as express.Request
        // noinspection UnnecessaryLocalVariableJS
        const session = await new Promise((resolve) => {
            sessionMiddleware(req, {} as express.Response, () => resolve(req.session));
        });
        return session;
    }
}, wsServer);

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
        ApolloServerPluginDrainHttpServer({httpServer}),
        drainPlugin,
        ApolloServerPluginLandingPageLocalDefault({includeCookies: true})
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
    context: async ({req, res}) => {
        const {user} = req.session;
        // if (!user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
        // TODO Add build session from request authorization
        return {user, req, res}
    }
});
app.use(PORTAL_GRAPHQL_PATH, cors<cors.CorsRequest>(), json(), middlewareExpress);
// endregion

// Ensure migrate the schema
await dbMigration.migrate();
await platformInit();
console.log('[Migration] Database version is now ' + await dbMigration.version());

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({port: portalConfig.port}, resolve));
console.log(`🚀 Server ready at http://localhost:` + portalConfig.port);