import { ServiceDefinitionIdentifierEnum } from '@xtm-hub/portal-front/__generated__/models/ServiceDefinitionIdentifier.enum';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
} from './telemetry.const';
import {
  LoginEvent,
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
  ServiceDefinitionIdentifierEnum,
  TelemetryEventService
>([
  [
    ServiceDefinitionIdentifierEnum.OBAS_SCENARIOS,
    TelemetryEventService.OPENAEV_SCENARIO_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifierEnum.CSV_FEEDS,
    TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
  ],
  [
    ServiceDefinitionIdentifierEnum.CUSTOM_DASHBOARDS,
    TelemetryEventService.CUSTOM_DASHBOARD_LIBRARY,
  ],
]);

export function shouldSendEventForService(
  service: ServiceDefinitionIdentifierEnum
) {
  return ServiceIdentifierToEventService.has(service);
}

const ServiceIdentifierToEventServiceType = new Map<
  ServiceDefinitionIdentifierEnum,
  TelemetryEventServiceType
>([
  [
    ServiceDefinitionIdentifierEnum.CSV_FEEDS,
    TelemetryEventServiceType.CSV_FEEDS,
  ],
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
  service: ServiceDefinitionIdentifierEnum,
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
