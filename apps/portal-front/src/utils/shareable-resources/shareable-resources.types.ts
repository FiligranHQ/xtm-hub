import { ShareableResourceConnectorType } from '@/components/service/document/connector/shareable-resource-connector-slug-public';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { integrationFeedsItem_fragment$data } from '@generated/integrationFeedsItem_fragment.graphql';
import { openaevScenariosItem_fragment$data } from '@generated/openaevScenariosItem_fragment.graphql';
import { ConcreteRequest } from 'relay-runtime';

export type ShareableResource =
  | customDashboardsItem_fragment$data
  | csvFeedsItem_fragment$data
  | integrationFeedsItem_fragment$data
  | openaevScenariosItem_fragment$data
  | SeoIntegrationFeed
  | SeoCustomDashboard
  | SeoOpenAEVScenario;

export type SubscribableResource =
  | csvFeedsItem_fragment$data
  | integrationFeedsItem_fragment$data
  | openaevScenariosItem_fragment$data
  | customDashboardsItem_fragment$data;

export enum ShareableResourceType {
  OPENAEV_SCENARIO = 'openaev_scenario',
  OPENCTI_INTEGRATION_FEEDS = 'opencti_integration_feed',
  OPENCTI_CUSTOM_DASHBOARDS = 'opencti_custom_dashboard',
}

export const SHAREABLE_RESOURCE_TYPE_NAME_MAPPING = {
  openaev_scenario: 'Scenario OpenAEV',
  opencti_integration_feed: 'Feed OpenCTI',
  opencti_custom_dashboard: 'Custom Dashboard OpenCTI',
};

export const isIntegrationFeedItem = (
  resource:
    | SubscribableResource
    | ShareableResource
    | ShareableResourceConnectorType
): resource is integrationFeedsItem_fragment$data => {
  return resource.type === ShareableResourceType.OPENCTI_INTEGRATION_FEEDS;
};

export const isConnectorResource = (
  resource:
    | SubscribableResource
    | ShareableResource
    | ShareableResourceConnectorType
): resource is ShareableResourceConnectorType => {
  return isIntegrationFeedItem(resource) && resource.__typename === 'Connector';
};

export type SeoResource =
  | SeoIntegrationFeed
  | SeoCustomDashboard
  | SeoOpenAEVScenario;

export interface SeoCustomDashboard {
  description: string;
  id: string;
  type: 'opencti_custom_dashboards';
  children_documents: {
    id: string;
  }[];
  created_at: string;
  updated_at: string;
  labels: {
    color: string;
    id: string;
    name: string;
  }[];
  name: string;
  slug: string;
  short_description: string;
  product_version: string;
  download_number: number;
  share_number: number;
  uploader: {
    first_name: string;
    last_name: string;
    picture: string;
  };
  active: boolean;
  service_instance: {
    id: string;
    slug: string;
  };
  uploader_organization: {
    id: string;
    name: string;
    personal_space: boolean;
  };
}

export interface SeoIntegrationFeed {
  description: string;
  id: string;
  type: 'opencti_integration_feeds';
  children_documents: {
    id: string;
  }[];
  created_at: string;
  updated_at: string;
  labels: {
    color: string;
    id: string;
    name: string;
  }[];
  name: string;
  slug: string;
  short_description: string;
  download_number: number;
  share_number: number;
  uploader: {
    first_name: string;
    last_name: string;
    picture: string;
  };
  active: boolean;
  service_instance: {
    id: string;
    slug: string;
  };
  uploader_organization: {
    id: string;
    name: string;
    personal_space: boolean;
  };
}

export interface SeoOpenAEVScenario {
  description: string;
  id: string;
  type: 'openaev_scenario';
  children_documents: {
    id: string;
  }[];
  created_at: string;
  updated_at: string;
  labels: {
    color: string;
    id: string;
    name: string;
  }[];
  name: string;
  slug: string;
  short_description: string;
  product_version: string;
  download_number: number;
  share_number: number;
  uploader: {
    first_name: string;
    last_name: string;
    picture: string;
  };
  active: boolean;
  service_instance: {
    id: string;
    slug: string;
  };
  uploader_organization: {
    id: string;
    name: string;
    personal_space: boolean;
  };
}

export type QueryMapEntry<TReturn> = {
  query: ConcreteRequest;
  cast: (data: unknown) => TReturn;
};

export type MakeQueryMapParams = {
  query: ConcreteRequest;
  key: string;
};

export type ServiceInfo = { link: string; description: string };
export enum ServiceSlug {
  OPEN_CTI_INTEGRATION_FEEDS = 'open-cti-integration-feeds',
  OPEN_CTI_CUSTOM_DASHBOARDS = 'open-cti-custom-dashboards',
  OPEN_BAS_SCENARIOS = 'open-bas-scenarios',
}
