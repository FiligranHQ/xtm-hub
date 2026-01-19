import {
  Document as DocumentResolverType,
  IntegrationType,
} from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import type { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { MetadataArray } from '../../../utils/metadata';

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
  Exclude<keyof Omit<CsvFeed, 'labels'>, keyof DocumentResolverType>
>;

export type TaxiiFeedMetadata = MetadataArray<
  Exclude<keyof Omit<TaxiiFeed, 'labels'>, keyof DocumentResolverType>
>;

export type StreamFeedMetadata = MetadataArray<
  Exclude<keyof Omit<Stream, 'labels'>, keyof DocumentResolverType>
>;

export type ThirdPartyIntegrationMetadata = MetadataArray<
  Exclude<
    keyof Omit<ThirdPartyIntegration, 'labels'>,
    keyof DocumentResolverType
  >
>;

export type ConnectorMetadata = MetadataArray<
  Exclude<keyof Omit<Connector, 'labels'>, keyof DocumentResolverType>
>;

export const INTEGRATION_CSV_FEED_METADATA: CsvFeedMetadata = [
  { key: 'feed_url' },
  { key: 'integration_type' },
];
export const INTEGRATION_CSV_FEED_METADATA_KEYS =
  INTEGRATION_CSV_FEED_METADATA.map(({ key }) => key);

export const INTEGRATION_TAXII_FEED_METADATA: TaxiiFeedMetadata = [
  { key: 'feed_url' },
  { key: 'integration_type' },
  { key: 'integration_subtype' },
];
export const INTEGRATION_TAXII_FEED_METADATA_KEYS =
  INTEGRATION_TAXII_FEED_METADATA.map(({ key }) => key);

export const INTEGRATION_STREAM_METADATA: StreamFeedMetadata = [
  { key: 'feed_url' },
  { key: 'integration_type' },
  { key: 'integration_subtype' },
];
export const INTEGRATION_STREAM_METADATA_KEYS = INTEGRATION_STREAM_METADATA.map(
  ({ key }) => key
);

export const INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA: ThirdPartyIntegrationMetadata =
  [
    { key: 'integration_subtype' },
    { key: 'product_version', optional: true },
    { key: 'vendor_url' },
    { key: 'github_url', optional: true },
  ];
export const INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA_KEYS =
  INTEGRATION_THIRD_PARTY_INTEGRATION_METADATA.map(({ key }) => key);

export const INTEGRATION_CONNECTOR_METADATA: ConnectorMetadata = [
  { key: 'product_version' },
  { key: 'container_image' },
  { key: 'verified' },
  { key: 'source_code' },
  { key: 'subscription_link' },
  { key: 'integration_subtype' },
  { key: 'integration_type' },
  { key: 'manager_supported' },
  { key: 'playbook_supported' },
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
