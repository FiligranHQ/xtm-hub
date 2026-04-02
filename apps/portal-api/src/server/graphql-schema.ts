import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { glob } from 'glob';
import fs from 'node:fs';
import ingestManifestResolver from '../modules/ingest-manifest/ingest-manifest.resolver';
import logResolver from '../modules/log/log.resolver';
import organizationsResolver from '../modules/organizations/organizations.resolver';
import competitorResolver from '../modules/services/competitor/competitor.resolver';
import ServiceDefinitionResolver from '../modules/services/definition/service-definition.resolver';
import deploymentResolver from '../modules/services/deployments/deployments.resolver';
import vaultResolver from '../modules/services/document/document.resolver';
import openAEVScenariosResolver from '../modules/services/document/openaev/scenarios/scenarios.resolver';
import customDashboardsResolver from '../modules/services/document/opencti/custom-dashboards/custom-dashboards.resolver';
import integrationsResolver from '../modules/services/document/opencti/integrations/integrations.resolver';
import serviceGroupResolver from '../modules/services/group/service-group.resolver';
import registrationResolver from '../modules/services/registration/registration.resolver';
import ServiceInstanceResolver from '../modules/services/services.resolver';
import settingsResolver from '../modules/settings/settings.resolver';
import subscriptionsResolver from '../modules/subcription/subscription.resolver';
import telemetryResolver from '../modules/telemetry/telemetry.resolver';
import useCaseResolver from '../modules/use-case/use-case.resolver';
import serviceCapabilityResolver from '../modules/user_service/service-capability/service-capability.resolver';
import userServiceResolver from '../modules/user_service/user_service.resolver';
import usersResolver from '../modules/users/users.resolver';
import xtmSuiteRoadmapResolver from '../modules/xtm-suite-roadmap/epic.resolver';
import nodesResolver from '../nodes/nodes.resolver';
import { authDirectiveTransformer } from '../security/directive-graphql/directive-auth';
import { idDirectiveTransformer } from '../security/directive-graphql/id-directive.transformer';

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
  const schemaWithIdDirective = idDirectiveTransformer(graphQLSchema);
  return authDirectiveTransformer(schemaWithIdDirective);
};

export default createSchema;
