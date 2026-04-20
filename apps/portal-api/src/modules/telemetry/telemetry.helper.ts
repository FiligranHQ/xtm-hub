import {
  DeploymentRequestSource,
  IntegrationType,
  Organization,
  PlatformContract,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { UserId } from '../../model/kanel/public/User';
import { loadOrganizationBy } from '../organization-management/organizations/organizations.domain';

import { requestContext } from '../../context/request.context';
import { DocumentMetadataDomain } from '../document/domain/document.metadata.domain';
import { loadServiceDefinitionByServiceInstance } from '../service/instance/service-instance.domain';
import {
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetryOrganizationType,
  TelemetrySource,
  TelemetryTargetProduct,
} from './telemetry.const';
import {
  BaseTelemetryEvent,
  CreateDeploymentEvent,
  CreateEvent,
  CreateOrganizationEvent,
  DownloadEvent,
  LoginEvent,
  OneClickDeployEvent,
  RegisterPlatformEvent,
  ShareEvent,
  SubscribeEvent,
  TelemetryEventType,
  UpdateDeploymentEvent,
  UpdateOrganizationEvent,
} from './telemetry.types';

function buildBaseEvent(
  organization: Organization | undefined,
  user_id: UserId | undefined,
  timestamp?: Date,
  source: TelemetrySource = TelemetrySource.XTMHUB
) {
  const eventTimestamp = timestamp || new Date();
  const organization_type: TelemetryOrganizationType = !organization
    ? TelemetryOrganizationType.PUBLIC
    : organization.personal_space
      ? TelemetryOrganizationType.PERSONAL
      : TelemetryOrganizationType.PROFESSIONAL;
  return {
    organization_id: organization?.id,
    organization_name: organization?.name,
    organization_type: organization_type,
    user_id,
    '@timestamp': eventTimestamp.toISOString(),
    source,
  };
}

const ServiceIdentifierToEventService = new Map<
  ServiceDefinitionIdentifier,
  TelemetryEventService
>([
  [
    ServiceDefinitionIdentifier.OpenaevScenarios,
    TelemetryEventService.OPENAEV_SCENARIOS_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifier.OpenctiIntegrations,
    TelemetryEventService.INTEGRATIONS_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifier.OpenctiCustomDashboards,
    TelemetryEventService.CUSTOM_DASHBOARDS_LIBRARY,
  ],
]);

const TelemetryTargetProductMappedByPlatformIdentifier = new Map<
  PlatformIdentifier,
  TelemetryTargetProduct
>([
  [PlatformIdentifier.Opencti, TelemetryTargetProduct.OPEN_CTI],
  [PlatformIdentifier.Openaev, TelemetryTargetProduct.OPEN_AEV],
]);

export function shouldSendEventForService(
  service: ServiceDefinitionIdentifier
) {
  return ServiceIdentifierToEventService.has(service);
}

const IntegrationTypeToEventServiceType = new Map<
  IntegrationType,
  TelemetryEventServiceType
>([
  [IntegrationType.CsvFeed, TelemetryEventServiceType.CSV_FEEDS],
  [IntegrationType.Connector, TelemetryEventServiceType.CONNECTORS],
  [IntegrationType.TaxiiFeed, TelemetryEventServiceType.TAXII_FEEDS],
  [IntegrationType.RssFeed, TelemetryEventServiceType.RSS_FEEDS],
  [IntegrationType.Stream, TelemetryEventServiceType.STREAMS],
  [
    IntegrationType.ThirdPartyIntegration,
    TelemetryEventServiceType.THIRD_PARTY_INTEGRATIONS,
  ],
]);

export const DeploymentRequestSourceToTelemetrySource = new Map<
  DeploymentRequestSource,
  TelemetrySource
>([
  [DeploymentRequestSource.Xtmhub, TelemetrySource.XTMHUB],
  [DeploymentRequestSource.OpenaevDemo, TelemetrySource.DEMO_OPENAEV],
  [DeploymentRequestSource.OpenctiDemo, TelemetrySource.DEMO_OPENCTI],
]);

const buildServiceTypeEvent = async (resource_id: string) => {
  const integration_type =
    await DocumentMetadataDomain.loadIntegrationType(resource_id);

  return IntegrationTypeToEventServiceType.get(integration_type);
};

export function buildLoginEvent(
  organization: Organization,
  user_id: UserId,
  timestamp?: Date
): LoginEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);
  return {
    event_type: TelemetryEventType.LOGIN,
    ...baseEvent,
  };
}

export function buildSubscribeEvent(
  organization: Organization,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  timestamp?: Date
): SubscribeEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.SUBSCRIBE,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
  };
}

export async function buildDownloadEvent(
  organization: Organization,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): Promise<DownloadEvent> {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.DOWNLOAD,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: await buildServiceTypeEvent(resource_id),
    resource_id: resource_id,
    resource_title: resource_title,
  };
}

export async function buildShareEvent(
  organization: Organization | undefined,
  user_id: UserId | undefined,
  service: ServiceDefinitionIdentifier,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): Promise<ShareEvent> {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.SHARE,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: await buildServiceTypeEvent(resource_id),
    resource_id: resource_id,
    resource_title: resource_title,
  };
}

export async function buildCreateEvent(
  document: Document,
  timestamp?: Date
): Promise<CreateEvent> {
  const { user } = requestContext.require();
  const selectedOrga = await loadOrganizationBy({
    id: user.selected_organization_id,
  });

  const baseEvent = buildBaseEvent(selectedOrga, user.id, timestamp);

  const serviceDefinition = await loadServiceDefinitionByServiceInstance(
    document.service_instance_id
  );

  return {
    event_type: TelemetryEventType.CREATE,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(serviceDefinition.identifier),
    service_type: await buildServiceTypeEvent(document.id),
    resource_id: document.id,
    resource_title: document.name,
    status: document.active ? 'published' : 'draft',
  };
}

export function buildRegisterEvent(
  organization: Organization,
  user_id: UserId,
  platform_identifier: PlatformIdentifier,
  platform_id: string,
  platform_contract: PlatformContract,
  platform_version: string,
  platform_url: string,
  existingUsersCount?: number,
  tenantId?: string,
  timestamp?: Date
): RegisterPlatformEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.REGISTER,
    ...baseEvent,
    target_product:
      TelemetryTargetProductMappedByPlatformIdentifier.get(platform_identifier),
    platform_id,
    platform_contract,
    platform_version,
    platform_url,
    ...(existingUsersCount !== undefined && {
      existing_users_count: existingUsersCount,
    }),
    ...(tenantId !== undefined && { tenant_id: tenantId }),
  };
}

export async function buildOneClickDeployEvent(
  organization: Organization,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  platform_identifier: PlatformIdentifier,
  platform_id: string,
  platform_version: string,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): Promise<OneClickDeployEvent> {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.ONE_CLICK_DEPLOY,
    ...baseEvent,
    target_product:
      TelemetryTargetProductMappedByPlatformIdentifier.get(platform_identifier),
    service: ServiceIdentifierToEventService.get(service),
    service_type: await buildServiceTypeEvent(resource_id),
    resource_id,
    resource_title,
    platform_id,
    platform_version,
  };
}

export function buildUpdateOrganizationEvent(
  organization: Organization,
  user_id: UserId,
  timestamp?: Date
): UpdateOrganizationEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.UPDATE_ORGANIZATION,
    ...baseEvent,
    domains: organization.domains,
  };
}

export function buildCreateOrganizationEvent(
  organization: Organization,
  user_id: UserId,
  timestamp?: Date
): CreateOrganizationEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.CREATE_ORGANIZATION,
    ...baseEvent,
    domains: organization.domains,
  };
}

export function buildCreateDeploymentEvent(
  organization: Organization,
  user_id: UserId,
  platform_identifier: PlatformIdentifier,
  source: DeploymentRequestSource,
  additional_data: Omit<
    CreateDeploymentEvent,
    'event_type' | 'target_product' | keyof BaseTelemetryEvent
  >,
  timestamp?: Date
): CreateDeploymentEvent {
  const baseEvent = buildBaseEvent(
    organization,
    user_id,
    timestamp,
    DeploymentRequestSourceToTelemetrySource.get(source)
  );

  return {
    ...baseEvent,
    ...additional_data,
    event_type: TelemetryEventType.CREATE_DEPLOYMENT,
    target_product:
      TelemetryTargetProductMappedByPlatformIdentifier.get(platform_identifier),
  };
}

export function buildUpdateDeploymentEvent(
  organization: Organization,
  user_id: UserId,
  additional_data: Omit<
    UpdateDeploymentEvent,
    'event_type' | keyof BaseTelemetryEvent
  >,
  timestamp?: Date
): UpdateDeploymentEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    ...baseEvent,
    ...additional_data,
    event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
  };
}
