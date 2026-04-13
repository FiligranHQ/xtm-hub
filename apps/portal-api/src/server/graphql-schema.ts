import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { glob } from 'glob';
import fs from 'node:fs';
import competitorResolver from '../modules/deployment/competitor/competitor.resolver';
import deploymentResolver from '../modules/deployment/deployment.resolver';
import serviceGroupResolver from '../modules/deployment/group/service-group.resolver';
import vaultResolver from '../modules/document/document.resolver';
import openAEVScenariosResolver from '../modules/document/openaev/scenarios/scenarios.resolver';
import customDashboardsResolver from '../modules/document/opencti/custom-dashboards/custom-dashboards.resolver';
import integrationsResolver from '../modules/document/opencti/integrations/integrations.resolver';
import ingestManifestResolver from '../modules/ingest-manifest/ingest-manifest.resolver';
import logResolver from '../modules/log/log.resolver';
import organizationsResolver from '../modules/organization-management/organizations/organizations.resolver';
import usersResolver from '../modules/organization-management/users/users.resolver';
import registrationResolver from '../modules/registration/registration.resolver';
import serviceCapabilityResolver from '../modules/security-management/service-capability/service-capability.resolver';
import ServiceDefinitionResolver from '../modules/services/definition/service-definition.resolver';
import ServiceInstanceResolver from '../modules/services/services.resolver';
import settingsResolver from '../modules/settings/settings.resolver';
import subscriptionsResolver from '../modules/subscription/subscription.resolver';
import telemetryResolver from '../modules/telemetry/telemetry.resolver';
import useCaseResolver from '../modules/use-case/use-case.resolver';
import userServiceResolver from '../modules/user_service/user_service.resolver';
import xtmSuiteRoadmapResolver from '../modules/xtm-suite-roadmap/epic.resolver';
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
  competitorResolver,
  xtmSuiteRoadmapResolver,
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
