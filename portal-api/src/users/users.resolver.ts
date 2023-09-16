import {Organization, OrganizationConnection, Resolvers} from "../__generated__/resolvers-types.js";
import {db, paginate} from "../../knexfile.js";
import {UserWithAuthentication} from "./users.js";
import {GraphQLError} from "graphql/error/index.js";
import {v4 as uuidv4} from 'uuid';
import crypto from "node:crypto";
import {fromGlobalId} from "graphql-relay/node/node.js";
import {PORTAL_COOKIE_NAME} from "../index.js";
import {hashPassword} from "../server/initialize.js";
import {loadUserByEmail, loadUsers} from "./users.domain.js";


const validPassword = (user: UserWithAuthentication, password: string): boolean => {
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
    return user.password === hash;
};

const resolvers: Resolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.user) throw new GraphQLError("You must be logged in", {extensions: {code: 'UNAUTHENTICATED'}});
            return context.user
        },
        users: async (_, {first, after, orderMode, orderBy}, context) => {
            if (!context.user) throw new GraphQLError("You must be logged in", {extensions: {code: 'UNAUTHENTICATED'}});
            return loadUsers(context, {first, after, orderMode, orderBy});
        },
        organizations: async (_, {first, after, orderMode, orderBy}, context) => {
            return paginate<Organization>(context, 'Organization', {first, after, orderMode, orderBy})
                .select('*').asConnection<OrganizationConnection>()
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
        login: async (_, {email, password}, context) => {
            const {req} = context;
            const logged = await loadUserByEmail(email);
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
                    resolve(user ? user.id : 'anonymous');
                });
            });
        }
    }
};

export default resolvers;