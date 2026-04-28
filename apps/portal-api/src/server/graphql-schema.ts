import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { glob } from 'glob';
import fs from 'node:fs';
import competitorResolver from '../modules/deployment/competitor/competitor.resolver';
import deploymentResolver from '../modules/deployment/deployment.resolver';
import serviceGroupResolver from '../modules/deployment/group/service-group.resolver';
import vaultResolver from '../modules/document/document.resolver';
import logResolver from '../modules/log/log.resolver';
import newsFeedResolver from '../modules/news-feed/news-feed.resolver';
import organizationsResolver from '../modules/organization-management/organizations/organizations.resolver';
import usersResolver from '../modules/organization-management/users/users.resolver';
import registrationResolver from '../modules/registration/registration.resolver';
import serviceCapabilityResolver from '../modules/security-management/service-capability/service-capability.resolver';
import ServiceDefinitionResolver from '../modules/service/definition/service-definition.resolver';
import ServiceInstanceResolver from '../modules/service/instance/service-instance.resolver';
import settingsResolver from '../modules/settings/settings.resolver';
import openAEVScenariosResolver from '../modules/shareable-resource/openaev/scenario/scenario.resolver';
import customDashboardsResolver from '../modules/shareable-resource/opencti/custom-dashboard/custom-dashboard.resolver';
import ingestManifestResolver from '../modules/shareable-resource/opencti/integration/ingest-manifest/ingest-manifest.resolver';
import integrationsResolver from '../modules/shareable-resource/opencti/integration/integration.resolver';
import subscriptionsResolver from '../modules/subscription/subscription.resolver';
import telemetryResolver from '../modules/telemetry/telemetry.resolver';
import useCaseResolver from '../modules/use-case/use-case.resolver';
import userServiceResolver from '../modules/user-service/user-service.resolver';
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
  newsFeedResolver,
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
