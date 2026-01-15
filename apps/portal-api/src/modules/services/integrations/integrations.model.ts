import {
  Document as DocumentResolverType,
  IntegrationType,
} from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import type { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';

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
export type CsvFeed = Integration;
export type TaxiiFeed = Integration & {
  integration_subtype: string;
};
export type Stream = Integration & {
  integration_subtype: string;
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

export type CsvFeedMetadataKeys = Array<
  Exclude<keyof Omit<CsvFeed, 'labels'>, keyof DocumentResolverType>
>;

export type TaxiiFeedMetadataKeys = Array<
  Exclude<keyof Omit<TaxiiFeed, 'labels'>, keyof DocumentResolverType>
>;

export type StreamFeedMetadataKeys = Array<
  Exclude<keyof Omit<Stream, 'labels'>, keyof DocumentResolverType>
>;

export type ConnectorMetadataKeys = Array<
  Exclude<keyof Omit<Connector, 'labels'>, keyof DocumentResolverType>
>;

export const INTEGRATION_CSV_FEED_METADATA: CsvFeedMetadataKeys = [
  'integration_type',
];
export const INTEGRATION_TAXII_FEED_METADATA: TaxiiFeedMetadataKeys = [
  'integration_type',
  'integration_subtype',
];
export const INTEGRATION_STREAM_METADATA: StreamFeedMetadataKeys = [
  'integration_type',
  'integration_subtype',
];
export const INTEGRATION_CONNECTOR_METADATA: ConnectorMetadataKeys = [
  'product_version',
  'container_image',
  'verified',
  'source_code',
  'subscription_link',
  'integration_subtype',
  'integration_type',
  'manager_supported',
  'playbook_supported',
];
export const INTEGRATION_METADATA = Array.from(
  new Set([
    ...INTEGRATION_CSV_FEED_METADATA,
    ...INTEGRATION_TAXII_FEED_METADATA,
    ...INTEGRATION_CONNECTOR_METADATA,
    ...INTEGRATION_STREAM_METADATA,
  ])
);
