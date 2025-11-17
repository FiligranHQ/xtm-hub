import { ConnectorTypeEnum } from '@generated/models/ConnectorType.enum';

export const connectorTypeMetadata: Record<
  ConnectorTypeEnum,
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
};

export const getIngestionConnectorMetadata = (integration_subtype?: string) => {
  return (
    connectorTypeMetadata[integration_subtype as ConnectorTypeEnum] ?? undefined
  );
};
