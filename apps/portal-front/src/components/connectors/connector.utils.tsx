export type IngestionConnectorType =
  | 'INTERNAL_ENRICHMENT'
  | 'EXTERNAL_IMPORT'
  | 'INTERNAL_EXPORT_FILE'
  | 'INTERNAL_IMPORT_FILE';

const ingestionConnectorTypeMetadata: Record<
  IngestionConnectorType,
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
};

export const getIngestionConnectorMetadata = (integration_subtype?: string) => {
  return (
    ingestionConnectorTypeMetadata[
      integration_subtype as IngestionConnectorType
    ] ?? undefined
  );
};
