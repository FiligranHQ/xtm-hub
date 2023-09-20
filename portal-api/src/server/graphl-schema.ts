import fs from 'node:fs';
import {mergeResolvers, mergeTypeDefs} from '@graphql-tools/merge';
import {glob} from 'glob';
import {makeExecutableSchema} from "@graphql-tools/schema";
import nodesResolver from "../nodes/nodes.resolver.js";
import servicesResolver from "../services/services.resolver.js";
import usersResolver from "../users/users.resolver.js";
import organizationsResolver from "../organizations/organizations.resolver.js";
import {authDirectiveTransformer} from "../directives/auth.js";

const getGlobContent = async (pattern: string) => {
    const globFiles = await glob(pattern);
    return globFiles.map((t) => fs.readFileSync(t, 'utf-8'));
}

const typeDefFiles = await getGlobContent("src/**/*.graphql");
const typeDefs = mergeTypeDefs(typeDefFiles);

const resolvers = mergeResolvers([nodesResolver, servicesResolver, organizationsResolver, usersResolver]);

const createSchema = () => {
    const graphQLSchema = makeExecutableSchema({typeDefs, resolvers, inheritResolversFromInterfaces: true});
    return authDirectiveTransformer(graphQLSchema);
}

export default createSchema;