import { Organization, Resolvers, User } from "../__generated__/resolvers-types.js";
import { dbFrom, dbRaw } from "../../knexfile.js";
import { UserWithAuthentication } from "./users.js";
import { GraphQLError } from "graphql/error/index.js";
import { v4 as uuidv4 } from 'uuid';
import crypto from "node:crypto";
import { fromGlobalId } from "graphql-relay/node/node.js";

const hashPassword = (password: string) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return { salt, hash };
}
const validPassword = (user: UserWithAuthentication, password: string): boolean => {
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
    return user.password === hash;
};

const resolvers: Resolvers = {
    Query: {
        users: async (_, __, context) => {
            // This method only accessible for authenticated user
            if (!context.user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
            // Inspiration from https://github.com/knex/knex/issues/882
            return dbFrom<User>(context, 'User')
                .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
                .select(['User.*', dbRaw('(json_agg(org.*) ->> 0)::json')])
                .groupBy(['User.id', 'org.id']);
        },
        organizations: async (_, __, context) => {
            return dbFrom<Organization>(context, 'Organization').select('*');
        },
    },
    Mutation: {
        addUser: async (_, { email, password, organization_id }, context) => {
            const { salt, hash } = hashPassword(password);
            const { id: databaseId } = fromGlobalId(organization_id);
            const data = { id: uuidv4(), email, salt, password: hash, organization_id: databaseId };
            const [addedUser] = await dbFrom<UserWithAuthentication>(context, 'User').insert(data).returning('*');
            return addedUser;
        },
        addOrganization: async (_, { name }, context) => {
            const data = { id: uuidv4(), name };
            const [addOrganization] = await dbFrom<Organization>(context, 'Organization').insert(data).returning('*');
            return addOrganization;
        },
        // Login / Logout
        login: async (_, { email, password }, context) => {
            const { user, session } = context;
            // This method only accessible for unauthenticated user
            if (user) throw new GraphQLError("You must be anonymous", { extensions: { code: 'UNAUTHENTICATED' } });
            const logged = await dbFrom<UserWithAuthentication>(context, 'User', { unsecured: true }).where('email', email).first();
            if (validPassword(logged, password)) {
                session.user = logged;
                return logged;
            }
            return undefined;
        },
        logout: (_, __, { user, session }) => {
            session.user = null;
            return user.id;
        }
    }
};

export default resolvers;