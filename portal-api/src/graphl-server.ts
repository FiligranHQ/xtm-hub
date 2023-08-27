import fs from 'node:fs';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { glob } from 'glob';
import { makeExecutableSchema } from "@graphql-tools/schema";
import deploymentResolver from "./deployment/deployment.resolver.js";

const typeDefFiles = await glob("src/**/*.graphql");
const typeDefs = mergeTypeDefs(typeDefFiles.map((t) => fs.readFileSync(t, 'utf-8')));
const resolvers = mergeResolvers([deploymentResolver]);
const createSchema = () => makeExecutableSchema({ typeDefs, resolvers, inheritResolversFromInterfaces: true });

export default createSchema;