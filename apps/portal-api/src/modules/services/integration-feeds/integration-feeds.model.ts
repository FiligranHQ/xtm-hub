import {
  Document as DocumentResolverType,
  IntegrationFeedType,
} from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import type { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';

export const INTEGRATION_FEEDS_SERVICE_INSTANCE_ID: ServiceInstanceId =
  '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc' as ServiceInstanceId;
export const OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE =
  'opencti_integration_feed';

export type IntegrationFeed = Document & {
  integration_type: IntegrationFeedType;
};
export type CsvFeed = IntegrationFeed;
export type Connector = IntegrationFeed & {
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

export type ConnectorMetadataKeys = Array<
  Exclude<keyof Omit<Connector, 'labels'>, keyof DocumentResolverType>
>;

export const INTEGRATION_FEED_CSV_FEED_METADATA: CsvFeedMetadataKeys = [
  'integration_type',
];
export const INTEGRATION_FEED_CONNECTOR_METADATA: ConnectorMetadataKeys = [
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
export const INTEGRATION_FEED_METADATA = Array.from(
  new Set([
    ...INTEGRATION_FEED_CSV_FEED_METADATA,
    ...INTEGRATION_FEED_CONNECTOR_METADATA,
  ])
);
