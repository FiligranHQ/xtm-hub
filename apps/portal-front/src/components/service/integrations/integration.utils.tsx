import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';

export const availableIntegrationTypes: IntegrationTypeEnum[] = [
  IntegrationTypeEnum.TAXII_FEED,
  IntegrationTypeEnum.CONNECTOR,
  IntegrationTypeEnum.CSV_FEED,
  IntegrationTypeEnum.STREAM,
  IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
];

export const integrationsWithSubtype: IntegrationTypeEnum[] = [
  IntegrationTypeEnum.CONNECTOR,
  IntegrationTypeEnum.TAXII_FEED,
  IntegrationTypeEnum.STREAM,
  IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
];

export const integrationSubTypeMetadata: Record<
  IntegrationSubTypeEnum,
  { label: string; color: string }
> = {
  EXTERNAL_IMPORT: {
    label: 'External import',
    color: '#0099cc',
  },
  INTERNAL_ENRICHMENT: {
    label: 'Internal enrichment',
    color: '#00f0bc',
  },
  INTERNAL_EXPORT_FILE: {
    label: 'Internal export file',
    color: '#b8180a',
  },
  INTERNAL_IMPORT_FILE: {
    label: 'Internal import file',
    color: '#20cb28',
  },
  STREAM: {
    label: 'Stream',
    color: '#e6700f',
  },
  NATIVE: {
    label: 'Native',
    color: '#f2be3a',
  },
  ORCHESTRATION: {
    label: 'Orchestration (SOAR)',
    color: '#0099cc',
  },
  DETECTION: {
    label: 'Detection (SIEM, XDR & EDR)',
    color: '#00f0bc',
  },
  CASE_MANAGEMENT: {
    label: 'Case Management, Other',
    color: '#b8180a',
  },
};

export const TaxiiFeedIntegrationSubTypes = [IntegrationSubTypeEnum.NATIVE];

export const StreamIntegrationSubTypes = [IntegrationSubTypeEnum.NATIVE];

export const ThirdPartyIntegrationIntegrationSubTypes = [
  IntegrationSubTypeEnum.ORCHESTRATION,
  IntegrationSubTypeEnum.DETECTION,
  IntegrationSubTypeEnum.CASE_MANAGEMENT,
];

export const getIntegrationSubTypeMetadata = (integration_subtype?: string) => {
  return (
    integrationSubTypeMetadata[integration_subtype as IntegrationSubTypeEnum] ??
    undefined
  );
};
