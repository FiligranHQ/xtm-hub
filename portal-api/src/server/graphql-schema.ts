import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { glob } from 'glob';
import fs from 'node:fs';
import logResolver from '../modules/log/log.resolver';
import organizationsResolver from '../modules/organizations/organizations.resolver';
import rolePortalResolver from '../modules/role-portal/role-portal.resolver';
import customDashboardsResolver from '../modules/services/custom-dashboards/custom-dashboards.resolver';
import csvFeedResolver from '../modules/services/document/csv-feed/csv-feed.resolver';
import vaultResolver from '../modules/services/document/document.resolver';
import servicesResolver from '../modules/services/services.resolver';
import labelsResolver from '../modules/settings/labels/labels.resolver';
import settingsResolver from '../modules/settings/settings.resolver';
import subscriptionsResolver from '../modules/subcription/subscription.resolver';
import trackingResolver from '../modules/tracking/tracking.resolver';
import serviceCapabilityResolver from '../modules/user_service/service-capability/service-capability.resolver';
import userServiceResolver from '../modules/user_service/user_service.resolver';
import usersResolver from '../modules/users/users.resolver';
import nodesResolver from '../nodes/nodes.resolver';
import { authDirectiveTransformer } from '../security/directive-auth';

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
  vaultResolver,
  subscriptionsResolver,
  userServiceResolver,
  serviceCapabilityResolver,
  logResolver,
  labelsResolver,
  customDashboardsResolver,
  csvFeedResolver,
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
