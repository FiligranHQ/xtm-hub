import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { glob } from 'glob';
import fs from 'node:fs';
import ingestManifestResolver from '../modules/ingest-manifest/ingest-manifest.resolver';
import logResolver from '../modules/log/log.resolver';
import organizationsResolver from '../modules/organizations/organizations.resolver';
import rolePortalResolver from '../modules/role-portal/role-portal.resolver';
import customDashboardsResolver from '../modules/services/custom-dashboards/custom-dashboards.resolver';
import ServiceDefinitionResolver from '../modules/services/definition/service-definition.resolver';
import deploymentResolver from '../modules/services/deployments/deployments.resolver';
import vaultResolver from '../modules/services/document/document.resolver';
import serviceGroupResolver from '../modules/services/group/service-group.resolver';
import integrationsResolver from '../modules/services/integrations/integrations.resolver';
import openAEVScenariosResolver from '../modules/services/openaev-scenarios/openaev-scenarios.resolver';
import registrationResolver from '../modules/services/registration/registration.resolver';
import ServiceInstanceResolver from '../modules/services/services.resolver';
import settingsResolver from '../modules/settings/settings.resolver';
import useCaseResolver from '../modules/settings/useCase/use-case.resolver';
import subscriptionsResolver from '../modules/subcription/subscription.resolver';
import telemetryResolver from '../modules/telemetry/telemetry.resolver';
import serviceCapabilityResolver from '../modules/user_service/service-capability/service-capability.resolver';
import userServiceResolver from '../modules/user_service/user_service.resolver';
import usersResolver from '../modules/users/users.resolver';
import nodesResolver from '../nodes/nodes.resolver';
import { authDirectiveTransformer } from '../security/directive-graphql/directive-auth';

const getGlobContent = async (pattern: string) => {
  const globFiles = await glob(pattern);
  return globFiles.sort().map((t) => fs.readFileSync(t, 'utf-8'));
};

const typeDefFiles = await getGlobContent('src/**/*.graphql');
const typeDefs = mergeTypeDefs(typeDefFiles);

const resolvers = mergeResolvers([
  nodesResolver,
  ServiceInstanceResolver,
  ServiceDefinitionResolver,
  organizationsResolver,
  usersResolver,
  settingsResolver,
  rolePortalResolver,
  vaultResolver,
  subscriptionsResolver,
  userServiceResolver,
  serviceCapabilityResolver,
  logResolver,
  useCaseResolver,
  customDashboardsResolver,
  openAEVScenariosResolver,
  registrationResolver,
  telemetryResolver,
  deploymentResolver,
  ingestManifestResolver,
  integrationsResolver,
  serviceGroupResolver,
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
