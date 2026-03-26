import {
  DocumentMetadataKeyCode,
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
export type RssFeed = Integration & {
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
  minimum_deployable_version?: string;
};

export type CsvFeedMetadata = MetadataArray<
  keyof Omit<CsvFeed, keyof Document>
>;

export type TaxiiFeedMetadata = MetadataArray<
  keyof Omit<TaxiiFeed, keyof Document>
>;

export type RssFeedMetadata = MetadataArray<
  Exclude<keyof Omit<RssFeed, 'use_cases'>, keyof DocumentResolverType>
>;

export type StreamFeedMetadata = MetadataArray<
  keyof Omit<Stream, keyof Document>
>;

export type ThirdPartyIntegrationMetadata = MetadataArray<
  keyof Omit<ThirdPartyIntegration, keyof Document>
>;

export type ConnectorMetadata = MetadataArray<
  keyof Omit<Connector, keyof Document>
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

export const INTEGRATION_RSS_FEED_METADATA: RssFeedMetadata = [
  { key: 'integration_type' },
  { key: 'integration_subtype' },
];
export const INTEGRATION_RSS_FEED_METADATA_KEYS =
  INTEGRATION_RSS_FEED_METADATA.map(({ key }) => key);

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
  { key: DocumentMetadataKeyCode.ManagerSupported },
  { key: DocumentMetadataKeyCode.PlaybookSupported },
  { key: DocumentMetadataKeyCode.MinimumDeployableVersion, optional: true },
  { key: DocumentMetadataKeyCode.DatasheetUrl, optional: true },
  { key: DocumentMetadataKeyCode.DemoUrl, optional: true },
];
export const INTEGRATION_CONNECTOR_METADATA_KEYS =
  INTEGRATION_CONNECTOR_METADATA.map(({ key }) => key);

export const INTEGRATION_METADATA_KEYS: DocumentMetadataKeyCode[] = Array.from(
  new Set([
    ...INTEGRATION_CSV_FEED_METADATA_KEYS,
    ...INTEGRATION_TAXII_FEED_METADATA_KEYS,
    ...INTEGRATION_RSS_FEED_METADATA_KEYS,
    ...INTEGRATION_CONNECTOR_METADATA_KEYS,
    ...INTEGRATION_STREAM_METADATA_KEYS,
    ...INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA_KEYS,
  ])
) as DocumentMetadataKeyCode[];
