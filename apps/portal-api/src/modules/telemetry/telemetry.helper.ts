import {
  OpenCtiPlatformContract,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { loadServiceDefinition } from '../services/service-instance.domain';

import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetryTargetProduct,
} from './telemetry.const';
import {
  CreateEvent,
  DownloadEvent,
  LoginEvent,
  RegisterPlatformEvent,
  ShareEvent,
  SubscribeEvent,
  TelemetryEventType,
} from './telemetry.types';

function buildBaseEvent(
  event_type: TelemetryEventType,
  organization_id: OrganizationId,
  organization_name: string,
  user_id: UserId,
  timestamp?: Date
) {
  const eventTimestamp = timestamp || new Date();
  return {
    event_type: event_type,
    organization_id: organization_id,
    organization_name: organization_name,
    user_id: user_id,
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
    TelemetryEventService.OPENAEV_SCENARIO_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifier.CsvFeeds,
    TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifier.CustomDashboards,
    TelemetryEventService.CUSTOM_DASHBOARD_LIBRARY,
  ],
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
  organization_id: OrganizationId,
  organization_name: string,
  user_id: UserId,
  timestamp?: Date
): LoginEvent {
  return buildBaseEvent(
    TelemetryEventType.LOGIN,
    organization_id,
    organization_name,
    user_id,
    timestamp
  ) as LoginEvent;
}

export function buildSubscribeEvent(
  organization_id: OrganizationId,
  organization_name: string,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  timestamp?: Date
): SubscribeEvent {
  const baseEvent = buildBaseEvent(
    TelemetryEventType.SUBSCRIBE,
    organization_id,
    organization_name,
    user_id,
    timestamp
  );

  return {
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: ServiceIdentifierToEventServiceType.get(service),
  } as SubscribeEvent;
}

export function buildDownloadEvent(
  organization_id: OrganizationId,
  organization_name: string,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): DownloadEvent {
  const baseEvent = buildBaseEvent(
    TelemetryEventType.DOWNLOAD,
    organization_id,
    organization_name,
    user_id,
    timestamp
  );

  return {
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: ServiceIdentifierToEventServiceType.get(service),
    resource_id: resource_id,
    resource_title: resource_title,
  } as DownloadEvent;
}

export function buildShareEvent(
  organization_id: OrganizationId,
  organization_name: string,
  user_id: UserId,
  service: ServiceDefinitionIdentifier,
  resource_id: string,
  resource_title: string,
  timestamp?: Date
): ShareEvent {
  const baseEvent = buildBaseEvent(
    TelemetryEventType.SHARE,
    organization_id,
    organization_name,
    user_id,
    timestamp
  );

  return {
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(service),
    service_type: ServiceIdentifierToEventServiceType.get(service),
    resource_id: resource_id,
    resource_title: resource_title,
  } as ShareEvent;
}

export async function buildCreateEvent(
  context: PortalContext,
  organization_id: OrganizationId,
  user_id: UserId,
  document: Document,
  timestamp?: Date
): Promise<CreateEvent> {
  const selectedOrga = await loadOrganizationBy(context, 'id', organization_id);

  const baseEvent = buildBaseEvent(
    TelemetryEventType.CREATE,
    organization_id,
    selectedOrga.name,
    user_id,
    timestamp
  );

  const serviceDefinition = await loadServiceDefinition(
    context,
    document.service_instance_id
  );

  return {
    ...baseEvent,
    service: ServiceIdentifierToEventService.get(serviceDefinition.identifier),
    service_type: ServiceIdentifierToEventServiceType.get(
      serviceDefinition.identifier
    ),
    resource_id: document.id,
    resource_title: document.name,
    status: document.active ? 'published' : 'draft',
  } as CreateEvent;
}

export function buildRegisterEvent(
  organization_id: OrganizationId,
  organization_name: string,
  organization_personal_space: boolean,
  user_id: UserId,
  target_product: TelemetryTargetProduct,
  platform_id: string,
  platform_contract: OpenCtiPlatformContract,
  timestamp?: Date
): RegisterPlatformEvent {
  const baseEvent = buildBaseEvent(
    TelemetryEventType.REGISTER,
    organization_id,
    organization_name,
    user_id,
    timestamp
  );

  return {
    ...baseEvent,
    organization_type: organization_personal_space
      ? 'Personal'
      : 'Professional',
    target_product,
    platform_id,
    platform_contract,
  } as RegisterPlatformEvent;
}
