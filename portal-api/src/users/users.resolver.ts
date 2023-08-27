import { Organization, Resolvers, User } from "../__generated__/resolvers-types.js";
import { database } from "../../knexfile.js";
import { UserWithAuthentication } from "./users.js";
import { GraphQLError } from "graphql/error/index.js";
import { v4 as uuidv4 } from 'uuid';
import { toGlobalId } from "graphql-relay";
import crypto from "node:crypto";

const idGenerator = (type: string) => toGlobalId(type, uuidv4());
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
        users: async (_, __, { user }) => {
            // This method only accessible for authenticated user
            if (!user) throw new GraphQLError("You must be logged in", { extensions: { code: 'UNAUTHENTICATED' } });
            // Inspiration from https://github.com/knex/knex/issues/882
            return database<User>('users')
                .leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                .select(['users.*', database.raw('(json_agg(organizations.*) ->> 0)::json as organization')])
                .groupBy(['users.id', 'organizations.id']);
        },
        organizations: async () => {
            return database<Organization>('organizations').select('*');
        },
    },
    Mutation: {
        addUser: async (_, { email, password, organization_id }) => {
            const { salt, hash } = hashPassword(password);
            const data = { id: idGenerator('users'), email, salt, password: hash, organization_id };
            const [addedUser] = await database<UserWithAuthentication>('users').insert(data).returning('*');
            return addedUser;
        },
        addOrganization: async (_, { name }) => {
            const data = { id: idGenerator('organizations'), name };
            const [addOrganization] = await database<Organization>('organizations').insert(data).returning('*');
            return addOrganization;
        },
        // Login / Logout
        login: async (_, { email, password }, { user, session }) => {
            // This method only accessible for unauthenticated user
            if (user) throw new GraphQLError("You must be anonymous", { extensions: { code: 'UNAUTHENTICATED' } });
            const logged = await database<UserWithAuthentication>('users').where('email', email).first();
            if (validPassword(logged, password)) {
                session.user = logged;
                return logged;
            }
            return undefined;
        },
        logout: (_, __, { user, session }) => {
            session.destroy();
            return user.id;
        }
    }
};

export default resolvers;