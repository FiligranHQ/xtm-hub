import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { LogicalFilterInput } from '@generated/documentsQuery.graphql';
import {
  FilterKey,
  IntegrationSubType,
  IntegrationType,
  LogicalOperator,
} from '@graphql/generated';

export const availableIntegrationTypes: IntegrationType[] = [
  IntegrationType.TaxiiFeed,
  IntegrationType.RssFeed,
  IntegrationType.Connector,
  IntegrationType.CsvFeed,
  IntegrationType.Stream,
  IntegrationType.ThirdPartyIntegration,
];

export const integrationSubTypeMetadata: Record<
  IntegrationSubType,
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
  IntegrationType,
  IntegrationSubType[]
>([
  [
    IntegrationType.Connector,
    [
      IntegrationSubType.ExternalImport,
      IntegrationSubType.InternalEnrichment,
      IntegrationSubType.InternalExportFile,
      IntegrationSubType.InternalImportFile,
      IntegrationSubType.Stream,
    ],
  ],
  [IntegrationType.TaxiiFeed, [IntegrationSubType.Native]],
  [
    IntegrationType.RssFeed,
    [
      IntegrationSubType.ThreatActors,
      IntegrationSubType.Malware,
      IntegrationSubType.CyberIndustry,
      IntegrationSubType.PeriodicBriefing,
      IntegrationSubType.SecurityResearcher,
      IntegrationSubType.Vendors,
      IntegrationSubType.FederalOrganization,
      IntegrationSubType.Journalists,
      IntegrationSubType.NotForProfitOrganization,
      IntegrationSubType.SocialMedia,
      IntegrationSubType.Darkweb,
    ],
  ],
  [IntegrationType.CsvFeed, []],
  [IntegrationType.Stream, [IntegrationSubType.Native]],
  [
    IntegrationType.ThirdPartyIntegration,
    [
      IntegrationSubType.Orchestration,
      IntegrationSubType.Detection,
      IntegrationSubType.CaseManagement,
    ],
  ],
]);

export const getIntegrationSubTypeMetadata = (integration_subtype?: string) => {
  return (
    integrationSubTypeMetadata[integration_subtype as IntegrationSubType] ??
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
          key: FilterKey.IntegrationType,
          value: [type],
        },
      };
      const subtypeFilter: LogicalFilterInput = {
        leaf: {
          key: FilterKey.IntegrationSubtype,
          value: subtypes,
        },
      };
      const andExpression: LogicalFilterInput = {
        operator: LogicalOperator.And,
        children: [typeFilter, subtypeFilter],
      };
      typeExpressions.push(andExpression);
    }
  }

  if (typesWithoutSubtypes.length > 0) {
    const groupedTypeFilter: LogicalFilterInput = {
      leaf: {
        key: FilterKey.IntegrationType,
        value: typesWithoutSubtypes,
      },
    };
    typeExpressions.push(groupedTypeFilter);
  }

  if (typeExpressions.length === 1) {
    return typeExpressions[0];
  }

  return {
    operator: LogicalOperator.Or,
    children: typeExpressions,
  };
};
