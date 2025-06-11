import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import SeoCsvFeedBySlugQuery from '@generated/seoCsvFeedBySlugQuery.graphql';
import SeoCsvFeedsByServiceSlugQuery from '@generated/seoCsvFeedsByServiceSlugQuery.graphql';
import SeoCustomDashboardBySlugQuery from '@generated/seoCustomDashboardBySlugQuery.graphql';
import SeoCustomDashboardsByServiceSlugQuery from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';

import { fromGlobalId } from '@/utils/globalId';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { ConcreteRequest } from 'relay-runtime';

export type ShareableResource =
  | customDashboardsItem_fragment$data
  | csvFeedsItem_fragment$data
  | SeoCsvFeed
  | SeoCustomDashboard;

export type SeoResource = SeoCsvFeed | SeoCustomDashboard;

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

type QueryMapEntry<TReturn> = {
  query: ConcreteRequest;
  cast: (data: unknown) => TReturn;
};

type MakeQueryMapParams = {
  query: ConcreteRequest;
  key: string;
};

type ServiceInfo = { link: string; description: string };
export type ServiceSlug =
  | 'open-cti-integration-feeds'
  | 'custom-open-cti-dashboards';

function makeQueryMapEntry<TReturn>({
  query,
  key,
}: Omit<MakeQueryMapParams, 'isList'>): QueryMapEntry<TReturn[]> {
  const cast = (data: unknown): TReturn[] => {
    const safeData = data as Record<string, unknown>;
    return safeData[key] as TReturn[];
  };
  return { query, cast };
}

function makeSingleQueryMapEntry<TReturn>({
  query,
  key,
}: Omit<MakeQueryMapParams, 'isList'>): QueryMapEntry<TReturn> {
  const cast = (data: unknown): TReturn => {
    const safeData = data as Record<string, unknown>;
    return safeData[key] as TReturn;
  };
  return { query, cast };
}

const queryMap: Record<ServiceSlug, QueryMapEntry<SeoResource[]>> = {
  'open-cti-integration-feeds': makeQueryMapEntry<SeoCsvFeed>({
    query: SeoCsvFeedsByServiceSlugQuery,
    key: 'seoCsvFeedsByServiceSlug',
  }),
  'custom-open-cti-dashboards': makeQueryMapEntry<SeoCustomDashboard>({
    query: SeoCustomDashboardsByServiceSlugQuery,
    key: 'seoCustomDashboardsByServiceSlug',
  }),
};

const querySlugMap: Record<ServiceSlug, QueryMapEntry<SeoResource>> = {
  'open-cti-integration-feeds': makeSingleQueryMapEntry<SeoCsvFeed>({
    query: SeoCsvFeedBySlugQuery,
    key: 'seoCsvFeedBySlug',
  }),
  'custom-open-cti-dashboards': makeSingleQueryMapEntry<SeoCustomDashboard>({
    query: SeoCustomDashboardBySlugQuery,
    key: 'seoCustomDashboardBySlug',
  }),
};

export async function fetchAllDocuments(
  serviceSlug: ServiceSlug
): Promise<SeoResource[]> {
  const config = queryMap[serviceSlug];
  const response = await serverFetchGraphQL(
    config.query,
    { serviceSlug },
    { cache: 'force-cache' }
  );
  return config.cast(response.data);
}

export async function fetchSingleDocument(
  serviceSlug: ServiceSlug,
  slug: string
): Promise<ShareableResource> {
  const config = querySlugMap[serviceSlug];
  const response = await serverFetchGraphQL(
    config.query,
    { slug },
    { cache: 'force-cache' }
  );
  return config.cast(response.data);
}

export function getServiceInfo(
  serviceInstance: { id: string; slug: ServiceSlug },
  documentId: string
): ServiceInfo | undefined {
  const serviceId = fromGlobalId(serviceInstance.id).id;

  const serviceMap: Record<ServiceSlug, ServiceInfo> = {
    'open-cti-integration-feeds': {
      link: `/redirect/integration_feeds?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more OpenCTI integration feeds like this in our OpenCTI Integration Feeds Library, available for download on the XTM Hub.',
    },
    'custom-open-cti-dashboards': {
      link: `/redirect/custom_dashboards?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.',
    },
  };

  return serviceMap[serviceInstance.slug];
}
