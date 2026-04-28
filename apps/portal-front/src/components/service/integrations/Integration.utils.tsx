import { LogicalFilterInput } from '@generated/documentsQuery.graphql';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';
import { LogicalMultiSelectSelection } from '../../ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';

export const availableIntegrationTypes: IntegrationTypeEnum[] = [
  IntegrationTypeEnum.TAXII_FEED,
  IntegrationTypeEnum.RSS_FEED,
  IntegrationTypeEnum.CONNECTOR,
  IntegrationTypeEnum.CSV_FEED,
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
  THREAT_ACTORS: {
    label: 'Threat Actors',
    color: '#b8180a',
  },
  MALWARE: {
    label: 'Malware',
    color: '#18832f',
  },
  CYBER_INDUSTRY: {
    label: 'Cyber Industry',
    color: '#1d5fc1',
  },
  PERIODIC_BRIEFING: {
    label: 'Periodic Briefing',
    color: '#af7bcf',
  },
  SECURITY_RESEARCHER: {
    label: 'Security Reseacher',
    color: '#5b5b5e',
  },
  VENDORS: {
    label: 'Vendors',
    color: '#d59ad8',
  },
  FEDERAL_ORGANIZATION: {
    label: 'Federal Organization',
    color: '#b6b6b6',
  },
  JOURNALISTS: {
    label: 'Journalists',
    color: '#ddc048',
  },
  NOT_FOR_PROFIT_ORGANIZATION: {
    label: 'Not-for-profit organization',
    color: '#dc8a1d',
  },
  SOCIAL_MEDIA: {
    label: 'Social Media',
    color: '#18832f',
  },
  DARKWEB: {
    label: 'Darkweb',
    color: '#265cea',
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
  [
    IntegrationTypeEnum.RSS_FEED,
    [
      IntegrationSubTypeEnum.THREAT_ACTORS,
      IntegrationSubTypeEnum.MALWARE,
      IntegrationSubTypeEnum.CYBER_INDUSTRY,
      IntegrationSubTypeEnum.PERIODIC_BRIEFING,
      IntegrationSubTypeEnum.SECURITY_RESEARCHER,
      IntegrationSubTypeEnum.VENDORS,
      IntegrationSubTypeEnum.FEDERAL_ORGANIZATION,
      IntegrationSubTypeEnum.JOURNALISTS,
      IntegrationSubTypeEnum.NOT_FOR_PROFIT_ORGANIZATION,
      IntegrationSubTypeEnum.SOCIAL_MEDIA,
      IntegrationSubTypeEnum.DARKWEB,
    ],
  ],
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
  integrationSubtypesByTypes?: LogicalMultiSelectSelection
): LogicalFilterInput | null | undefined => {
  if (!integrationSubtypesByTypes) {
    return null;
  }

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
