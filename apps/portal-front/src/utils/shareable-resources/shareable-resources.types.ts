import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { ConcreteRequest } from 'relay-runtime';

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
  resource: documentItem_fragment$data | publicDocumentItemFragment$data
): boolean => {
  return resource.type === ShareableResourceType.OPENCTI_INTEGRATION;
};

export const isConnectorResource = (
  resource: documentItem_fragment$data
): boolean => {
  return resource.__typename === 'Connector';
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
  OPEN_CTI_INTEGRATIONS = 'opencti-integrations',
  OPEN_CTI_CUSTOM_DASHBOARDS = 'opencti-custom-dashboards',
  OPEN_AEV_SCENARIOS = 'openaev-scenarios',
}
