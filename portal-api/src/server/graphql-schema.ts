import fs from 'node:fs';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { glob } from 'glob';
import { makeExecutableSchema } from '@graphql-tools/schema';
import nodesResolver from '../nodes/nodes.resolver';
import servicesResolver from '../modules/services/services.resolver';
import usersResolver from '../modules/users/users.resolver';
import organizationsResolver from '../modules/organizations/organizations.resolver';
import subscriptionsResolver from '../modules/subcription/subscription.resolver';
import userServiceResolver from '../modules/user_service/user_service.resolver';
import serviceCapabilityResolver from '../modules/user_service/service-capability/service-capability.resolver';
import { authDirectiveTransformer } from '../security/directive-auth';
import settingsResolver from '../modules/settings/settings.resolver';
import trackingResolver from '../modules/tracking/tracking.resolver';
import rolePortalResolver from '../modules/role-portal/role-portal.resolver';
import malwareAnalysisResolver from '../modules/malware-analysis/malware-analysis.resolver';
import servicePriceResolver from '../modules/services/instances/service-price/service-price.resolver';
import vaultResolver from "../modules/services/vault/vault.resolver";

const getGlobContent = async (pattern: string) => {
  const globFiles = await glob(pattern);
  return globFiles.sort().map((t) => fs.readFileSync(t, 'utf-8'));
};

const typeDefFiles = await getGlobContent('src/**/*.graphql');
const typeDefs = mergeTypeDefs(typeDefFiles);

const resolvers = mergeResolvers([
  nodesResolver,
  servicesResolver,
  organizationsResolver,
  usersResolver,
  settingsResolver,
  trackingResolver,
  rolePortalResolver,
  malwareAnalysisResolver,
  vaultResolver,
  subscriptionsResolver,
  userServiceResolver,
  serviceCapabilityResolver,
  servicePriceResolver,
]);

const createSchema = () => {
  const graphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
    inheritResolversFromInterfaces: true,
  });
  return authDirectiveTransformer(graphQLSchema);
};

export default createSchema;
