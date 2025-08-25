import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { obasScenariosItem_fragment$data } from '@generated/obasScenariosItem_fragment.graphql';
import { ConcreteRequest } from 'relay-runtime';

export type ShareableResource =
  | customDashboardsItem_fragment$data
  | csvFeedsItem_fragment$data
  | obasScenariosItem_fragment$data
  | SeoCsvFeed
  | SeoCustomDashboard
  | SeoOpenAEVScenario;

export type SubscribableResource =
  | csvFeedsItem_fragment$data
  | obasScenariosItem_fragment$data;

export type SeoResource = SeoCsvFeed | SeoCustomDashboard | SeoOpenAEVScenario;

export interface SeoCustomDashboard {
  description: string;
  id: string;
  type: 'custom_dashboard';
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

export interface SeoCsvFeed {
  description: string;
  id: string;
  type: 'csv_feed';
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
