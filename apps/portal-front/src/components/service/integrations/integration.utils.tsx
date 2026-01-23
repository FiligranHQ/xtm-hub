import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select/logical-multi-select-form-field';
import { LogicalFilterInput } from '@generated/integrationsQuery.graphql';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';

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

export const SubTypesPerIntegrationType = new Map<
  IntegrationTypeEnum,
  IntegrationSubTypeEnum[]
>([
  [
    IntegrationTypeEnum.CONNECTOR,
    [
      IntegrationSubTypeEnum.EXTERNAL_IMPORT,
      IntegrationSubTypeEnum.INTERNAL_ENRICHMENT,
      IntegrationSubTypeEnum.INTERNAL_EXPORT_FILE,
      IntegrationSubTypeEnum.INTERNAL_IMPORT_FILE,
      IntegrationSubTypeEnum.STREAM,
    ],
  ],
  [IntegrationTypeEnum.TAXII_FEED, [IntegrationSubTypeEnum.NATIVE]],
  [IntegrationTypeEnum.CSV_FEED, []],
  [IntegrationTypeEnum.STREAM, [IntegrationSubTypeEnum.NATIVE]],
  [
    IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
    [
      IntegrationSubTypeEnum.ORCHESTRATION,
      IntegrationSubTypeEnum.DETECTION,
      IntegrationSubTypeEnum.CASE_MANAGEMENT,
    ],
  ],
]);

export const getIntegrationSubTypeMetadata = (integration_subtype?: string) => {
  return (
    integrationSubTypeMetadata[integration_subtype as IntegrationSubTypeEnum] ??
    undefined
  );
};

export const buildTypeSubtypeFilterExpression = (
  integrationSubtypesByTypes: LogicalMultiSelectSelection
): LogicalFilterInput | null | undefined => {
  const entries = Object.entries(integrationSubtypesByTypes);

  if (entries.length === 0) {
    return null;
  }

  const typeExpressions: LogicalFilterInput[] = [];
  const typesWithoutSubtypes: string[] = [];

  for (const [type, subtypes] of entries) {
    if (subtypes.length === 0) {
      typesWithoutSubtypes.push(type);
    } else {
      const typeFilter: LogicalFilterInput = {
        leaf: {
          key: FilterKeyEnum.INTEGRATION_TYPE,
          value: [type],
        },
      };
      const subtypeFilter: LogicalFilterInput = {
        leaf: {
          key: FilterKeyEnum.INTEGRATION_SUBTYPE,
          value: subtypes,
        },
      };
      const andExpression: LogicalFilterInput = {
        operator: LogicalOperatorEnum.AND,
        children: [typeFilter, subtypeFilter],
      };
      typeExpressions.push(andExpression);
    }
  }

  if (typesWithoutSubtypes.length > 0) {
    const groupedTypeFilter: LogicalFilterInput = {
      leaf: {
        key: FilterKeyEnum.INTEGRATION_TYPE,
        value: typesWithoutSubtypes,
      },
    };
    typeExpressions.push(groupedTypeFilter);
  }

  if (typeExpressions.length === 1) {
    return typeExpressions[0];
  }

  return {
    operator: LogicalOperatorEnum.OR,
    children: typeExpressions,
  };
};
