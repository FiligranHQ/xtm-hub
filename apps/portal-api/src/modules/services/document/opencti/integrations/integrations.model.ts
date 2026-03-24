import {
  DocumentMetadataKeyCode,
  Document as DocumentResolverType,
  IntegrationType,
} from '../../../../../__generated__/resolvers-types';
import Document from '../../../../../model/kanel/public/Document';
import type { ServiceInstanceId } from '../../../../../model/kanel/public/ServiceInstance';
import { MetadataArray } from '../../../../../utils/metadata';

export const INTEGRATION_SERVICE_INSTANCE_ID: ServiceInstanceId =
  '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc' as ServiceInstanceId;
export const OPENCTI_INTEGRATION_DOCUMENT_TYPE = 'opencti_integration';

export const isIntegrationType = (
  maybeIntegrationType: string
): maybeIntegrationType is IntegrationType => {
  return (Object.values(IntegrationType) as string[]).includes(
    maybeIntegrationType
  );
};

export type Integration = Document & {
  integration_type: IntegrationType;
  datasheet_url?: string;
  demo_url?: string;
};
export type CsvFeed = Integration & {
  feed_url: string;
};
export type TaxiiFeed = Integration & {
  feed_url: string;
  integration_subtype: string;
};
export type Stream = Integration & {
  feed_url: string;
  integration_subtype: string;
};
export type ThirdPartyIntegration = Integration & {
  integration_subtype: string;
  vendor_url: string;
  github_url?: string;
  product_version?: string;
};
export type Connector = Integration & {
  product_version: string;
  container_image?: string | null; // Docker/container identifier
  verified: boolean;
  source_code?: string | null; // URL to repository
  subscription_link?: string | null; // URL to subscription page
  integration_subtype: string;
  manager_supported: boolean;
  playbook_supported: boolean;
};

export type CsvFeedMetadata = MetadataArray<
  Exclude<keyof Omit<CsvFeed, 'use_cases'>, keyof DocumentResolverType>
>;

export type TaxiiFeedMetadata = MetadataArray<
  Exclude<keyof Omit<TaxiiFeed, 'use_cases'>, keyof DocumentResolverType>
>;

export type StreamFeedMetadata = MetadataArray<
  Exclude<keyof Omit<Stream, 'use_cases'>, keyof DocumentResolverType>
>;

export type ThirdPartyIntegrationMetadata = MetadataArray<
  Exclude<
    keyof Omit<ThirdPartyIntegration, 'use_cases'>,
    keyof DocumentResolverType
  >
>;

export type ConnectorMetadata = MetadataArray<
  Exclude<keyof Omit<Connector, 'use_cases'>, keyof DocumentResolverType>
>;

export const INTEGRATION_CSV_FEED_METADATA: CsvFeedMetadata = [
  { key: DocumentMetadataKeyCode.FeedUrl },
  { key: DocumentMetadataKeyCode.IntegrationType },
  { key: DocumentMetadataKeyCode.DatasheetUrl, optional: true },
  { key: DocumentMetadataKeyCode.DemoUrl, optional: true },
];
export const INTEGRATION_CSV_FEED_METADATA_KEYS =
  INTEGRATION_CSV_FEED_METADATA.map(({ key }) => key);

export const INTEGRATION_TAXII_FEED_METADATA: TaxiiFeedMetadata = [
  { key: DocumentMetadataKeyCode.FeedUrl },
  { key: DocumentMetadataKeyCode.IntegrationType },
  { key: DocumentMetadataKeyCode.IntegrationSubtype },
  { key: DocumentMetadataKeyCode.DatasheetUrl, optional: true },
  { key: DocumentMetadataKeyCode.DemoUrl, optional: true },
];
export const INTEGRATION_TAXII_FEED_METADATA_KEYS =
  INTEGRATION_TAXII_FEED_METADATA.map(({ key }) => key);

export const INTEGRATION_STREAM_METADATA: StreamFeedMetadata = [
  { key: DocumentMetadataKeyCode.FeedUrl },
  { key: DocumentMetadataKeyCode.IntegrationType },
  { key: DocumentMetadataKeyCode.IntegrationSubtype },
  { key: DocumentMetadataKeyCode.DatasheetUrl, optional: true },
  { key: DocumentMetadataKeyCode.DemoUrl, optional: true },
];
export const INTEGRATION_STREAM_METADATA_KEYS = INTEGRATION_STREAM_METADATA.map(
  ({ key }) => key
);

export const INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA: ThirdPartyIntegrationMetadata =
  [
    { key: DocumentMetadataKeyCode.IntegrationSubtype },
    { key: DocumentMetadataKeyCode.ProductVersion, optional: true },
    { key: DocumentMetadataKeyCode.VendorUrl },
    { key: DocumentMetadataKeyCode.GithubUrl, optional: true },
    { key: DocumentMetadataKeyCode.DatasheetUrl, optional: true },
    { key: DocumentMetadataKeyCode.DemoUrl, optional: true },
  ];
export const INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA_KEYS =
  INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA.map(({ key }) => key);

export const INTEGRATION_CONNECTOR_METADATA: ConnectorMetadata = [
  { key: DocumentMetadataKeyCode.ProductVersion },
  { key: DocumentMetadataKeyCode.ContainerImage },
  { key: DocumentMetadataKeyCode.Verified },
  { key: DocumentMetadataKeyCode.SourceCode },
  { key: DocumentMetadataKeyCode.SubscriptionLink },
  { key: DocumentMetadataKeyCode.IntegrationSubtype },
  { key: DocumentMetadataKeyCode.IntegrationType },
  { key: 'manager_supported' },
  { key: 'playbook_supported' },
  { key: DocumentMetadataKeyCode.DatasheetUrl, optional: true },
  { key: DocumentMetadataKeyCode.DemoUrl, optional: true },
];
export const INTEGRATION_CONNECTOR_METADATA_KEYS =
  INTEGRATION_CONNECTOR_METADATA.map(({ key }) => key);

export const INTEGRATION_METADATA_KEYS: string[] = Array.from(
  new Set([
    ...INTEGRATION_CSV_FEED_METADATA_KEYS,
    ...INTEGRATION_TAXII_FEED_METADATA_KEYS,
    ...INTEGRATION_CONNECTOR_METADATA_KEYS,
    ...INTEGRATION_STREAM_METADATA_KEYS,
    ...INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA_KEYS,
  ])
);
