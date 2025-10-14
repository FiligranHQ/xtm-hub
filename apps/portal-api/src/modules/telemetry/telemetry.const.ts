export const TELEMETRY_SOURCE = 'xtm-hub' as const;

export enum TelemetryEventService {
  CUSTOM_DASHBOARDS_LIBRARY = 'custom-dashboards-library',
  OPENAEV_SCENARIOS_LIBRARY = 'openaev-scenarios-library',
  INTEGRATION_FEEDS_LIBRARY = 'integration-feeds-library',
}

export enum TelemetryEventServiceType {
  CSV_FEEDS = 'csv-feeds',
}

export enum TelemetryTargetProduct {
  OPEN_CTI = 'open-cti',
  OPEN_AEV = 'open-aev',
}

export enum TelemetryOrganizationType {
  PERSONAL = 'Personal',
  PROFESSIONAL = 'Professional',
  PUBLIC = 'Public',
}
