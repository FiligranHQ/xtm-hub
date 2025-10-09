import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import type { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';

export const INTEGRATION_FEEDS_SERVICE_INSTANCE_ID: ServiceInstanceId =
  '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc' as ServiceInstanceId;
export const OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE =
  'opencti_integration_feed';

export const INTEGRATION_FEED_CONNECTORS_TYPE = 'connector';
export const INTEGRATION_FEED_CSV_FEED_TYPE = 'csv_feed';

export type IntegrationFeed = Document & { integration_type: string };
export type CsvFeed = IntegrationFeed;
export type Connector = IntegrationFeed & {
  version: string;
  container_image?: string | null; // Docker/container identifier
  verified: boolean;
  source_code?: string | null; // URL to repository
  subscription_link?: string | null; // URL to subscription page
  integration_subtype: string;
  integration_type: string;
  manager_supported: boolean;
  playbook_supported: boolean;
};

export type CsvFeedMetadataKeys = Array<
  Exclude<keyof Omit<CsvFeed, 'labels'>, keyof DocumentResolverType>
>;

export type ConnectorMetadataKeys = Array<
  Exclude<keyof Omit<Connector, 'labels'>, keyof DocumentResolverType>
>;

export const CSV_FEED_METADATA: CsvFeedMetadataKeys = ['integration_type'];
export const CSV_FEED_CONNECTOR_METADATA: ConnectorMetadataKeys = [
  'version',
  'container_image',
  'verified',
  'source_code',
  'subscription_link',
  'integration_subtype',
  'integration_type',
  'manager_supported',
  'playbook_supported',
];
