import {
  Organization,
  PlatformContract,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { loadOrganizationBy } from '../organizations/organizations.domain';

import { OrganizationId } from '../../model/kanel/public/Organization';
import { loadServiceDefinitionByServiceInstance } from '../services/service-instance.domain';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetryOrganizationType,
  TelemetryTargetProduct,
} from './telemetry.const';
import {
  CreateEvent,
  CreateOrganizationEvent,
  DownloadEvent,
  LoginEvent,
  OneClickDeployEvent,
  RegisterPlatformEvent,
  ShareEvent,
  SubscribeEvent,
  TelemetryEventType,
  UpdateOrganizationEvent,
} from './telemetry.types';

function buildBaseEvent(
  organization: Organization,
  user_id: UserId,
  timestamp?: Date
) {
  const eventTimestamp = timestamp || new Date();
  return {
    organization_id: organization.id,
    organization_name: organization.name,
    organization_type: organization.personal_space
      ? TelemetryOrganizationType.PERSONAL
      : TelemetryOrganizationType.PROFESSIONAL,
    user_id,
    '@timestamp': eventTimestamp.toISOString(),
    source: TELEMETRY_SOURCE,
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
    ServiceDefinitionIdentifier.CsvFeeds,
    TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifier.CustomDashboards,
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

const ServiceIdentifierToEventServiceType = new Map<
  ServiceDefinitionIdentifier,
  TelemetryEventServiceType
>([
  [ServiceDefinitionIdentifier.CsvFeeds, TelemetryEventServiceType.CSV_FEEDS],
]);

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
    service_type: ServiceIdentifierToEventServiceType.get(service),
  };
}

export function buildDownloadEvent(
  organization: Organization,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): DownloadEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.DOWNLOAD,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: ServiceIdentifierToEventServiceType.get(service),
    resource_id: resource_id,
    resource_title: resource_title,
  };
}

export function buildShareEvent(
  organization: Organization,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): ShareEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.SHARE,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: ServiceIdentifierToEventServiceType.get(service),
    resource_id: resource_id,
    resource_title: resource_title,
  };
}

export async function buildCreateEvent(
  context: PortalContext,
  organization_id: OrganizationId,
  user_id: UserId,
  document: Document,
  timestamp?: Date
): Promise<CreateEvent> {
  const selectedOrga = await loadOrganizationBy({
    id: organization_id,
  });

  const baseEvent = buildBaseEvent(selectedOrga, user_id, timestamp);

  const serviceDefinition = await loadServiceDefinitionByServiceInstance(
    context,
    document.service_instance_id
  );

  return {
    event_type: TelemetryEventType.CREATE,
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(serviceDefinition.identifier),
    service_type: ServiceIdentifierToEventServiceType.get(
      serviceDefinition.identifier
    ),
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
  };
}

export function buildOneClickDeployEvent(
  organization: Organization,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  platform_identifier: PlatformIdentifier,
  platform_id: string,
  platform_version: string,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): OneClickDeployEvent {
  const baseEvent = buildBaseEvent(organization, user_id, timestamp);

  return {
    event_type: TelemetryEventType.ONE_CLICK_DEPLOY,
    ...baseEvent,
    target_product:
      TelemetryTargetProductMappedByPlatformIdentifier.get(platform_identifier),
    service: ServiceIdentifierToEventService.get(service),
    service_type: ServiceIdentifierToEventServiceType.get(service),
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
