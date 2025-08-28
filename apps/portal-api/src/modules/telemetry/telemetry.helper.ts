import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { TELEMETRY_SOURCE } from './telemetry.const';
import { LoginEvent, TelemetryEventType } from './telemetry.types';

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
