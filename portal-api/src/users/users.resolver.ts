import {Organization, Resolvers, User} from "../__generated__/resolvers-types.js";
import {db, dbRaw, paginate} from "../../knexfile.js";
import {UserWithAuthentication} from "./users.js";
import {GraphQLError} from "graphql/error/index.js";
import {v4 as uuidv4} from 'uuid';
import crypto from "node:crypto";
import {fromGlobalId} from "graphql-relay/node/node.js";
import {PORTAL_COOKIE_NAME} from "../index.js";

const hashPassword = (password: string) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return {salt, hash};
}
const validPassword = (user: UserWithAuthentication, password: string): boolean => {
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
    return user.password === hash;
};

const resolvers: Resolvers = {
    Query: {
        me: async (_, __, context) => {
            // This method only accessible for authenticated user
            if (!context.user) throw new GraphQLError("You must be logged in", {extensions: {code: 'UNAUTHENTICATED'}});
            return context.user
        },
        users: async (_, __, context) => {
            // This method only accessible for authenticated user
            if (!context.user) throw new GraphQLError("You must be logged in", {extensions: {code: 'UNAUTHENTICATED'}});
            // Inspiration from https://github.com/knex/knex/issues/882
            return db<User>(context, 'User')
                .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
                .select(['User.*', dbRaw('(json_agg(org.*) ->> 0)::json')])
                .groupBy(['User.id', 'org.id']);
        },
        organizations: async (_, { first, after, orderMode, orderBy }, context) => {
            return paginate<Organization>(context, 'Organization', { first, after, orderMode, orderBy }).select('*');
        },
    },
    Mutation: {
        addUser: async (_, {email, password, organization_id}, context) => {
            const {salt, hash} = hashPassword(password);
            const {id: databaseId} = fromGlobalId(organization_id);
            const data = {id: uuidv4(), email, salt, password: hash, organization_id: databaseId};
            const [addedUser] = await db<UserWithAuthentication>(context, 'User').insert(data).returning('*');
            return addedUser;
        },
        addOrganization: async (_, {name}, context) => {
            const data = {id: uuidv4(), name};
            const [addOrganization] = await db<Organization>(context, 'Organization').insert(data).returning('*');
            return addOrganization;
        },
        // Login / Logout
        login: async (_, {email, password}, context) => {
            const {user, req} = context;
            // This method only accessible for unauthenticated user
            if (user) throw new GraphQLError("You must be anonymous", {extensions: {code: 'UNAUTHENTICATED'}});
            const logged = await db<UserWithAuthentication>(context, 'User', {unsecured: true}).where('email', email).first();
            if (validPassword(logged, password)) {
                req.session.user = logged;
                return logged;
            }
            return undefined;
        },
        logout: async (_, __, {user, req, res}) => {
            return new Promise((resolve) => {
                res.clearCookie(PORTAL_COOKIE_NAME);
                req.session.regenerate(() => {
                    resolve(user.id);
                });
            });
        }
    }
};

export default resolvers;