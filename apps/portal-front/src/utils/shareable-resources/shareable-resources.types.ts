import { ShareableResourceConnectorType } from '@/components/service/document/connector/shareable-resource-connector-slug-public';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { integrationsItem_fragment$data } from '@generated/integrationsItem_fragment.graphql';
import { openaevScenariosItem_fragment$data } from '@generated/openaevScenariosItem_fragment.graphql';
import { seoIntegrationsItemFragment$data } from '@generated/seoIntegrationsItemFragment.graphql';
import { ConcreteRequest } from 'relay-runtime';

export type ShareableResource =
  | customDashboardsItem_fragment$data
  | integrationsItem_fragment$data
  | openaevScenariosItem_fragment$data
  | documentItem_fragment$data
  | SeoIntegration
  | SeoCustomDashboard
  | SeoOpenAEVScenario;

export type PublicShareableResource =
  | seoIntegrationsItemFragment$data
  | SeoIntegration
  | SeoCustomDashboard
  | SeoOpenAEVScenario;

export type SubscribableResource =
  | integrationsItem_fragment$data
  | openaevScenariosItem_fragment$data
  | customDashboardsItem_fragment$data
  | documentItem_fragment$data;

export enum ShareableResourceType {
  OPENAEV_SCENARIO = 'openaev_scenario',
  OPENCTI_INTEGRATION = 'opencti_integration',
  OPENCTI_CUSTOM_DASHBOARD = 'opencti_custom_dashboard',
}

export const SHAREABLE_RESOURCE_TYPE_NAME_MAPPING = {
  openaev_scenario: 'Scenario OpenAEV',
  opencti_integration: 'Feed OpenCTI',
  opencti_custom_dashboard: 'Custom Dashboard OpenCTI',
};

export const isIntegrationItem = (
  resource:
    | SubscribableResource
    | ShareableResource
    | ShareableResourceConnectorType
    | PublicShareableResource
): resource is integrationsItem_fragment$data => {
  return resource.type === ShareableResourceType.OPENCTI_INTEGRATION;
};

export const isConnectorResource = (
  resource:
    | SubscribableResource
    | ShareableResource
    | ShareableResourceConnectorType
    | PublicShareableResource
): resource is ShareableResourceConnectorType => {
  return isIntegrationItem(resource) && resource.__typename === 'Connector';
};

export type SeoResource =
  | SeoIntegration
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
  use_cases: {
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

export interface SeoIntegration {
  description: string;
  id: string;
  type: 'opencti_integrations';
  children_documents: {
    id: string;
  }[];
  created_at: string;
  updated_at: string;
  use_cases: {
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
  use_cases: {
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
  OPEN_CTI_INTEGRATIONS = 'open-cti-integrations',
  OPEN_CTI_CUSTOM_DASHBOARDS = 'open-cti-custom-dashboards',
  OPEN_AEV_SCENARIOS = 'open-aev-scenarios',
}
