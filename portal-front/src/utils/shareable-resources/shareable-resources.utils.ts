import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import SeoCsvFeedBySlugQuery from '@generated/seoCsvFeedBySlugQuery.graphql';
import SeoCsvFeedsByServiceSlugQuery from '@generated/seoCsvFeedsByServiceSlugQuery.graphql';
import SeoCustomDashboardBySlugQuery from '@generated/seoCustomDashboardBySlugQuery.graphql';
import SeoCustomDashboardsByServiceSlugQuery from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';

import { fromGlobalId } from '@/utils/globalId';
import { ConcreteRequest } from 'relay-runtime';

export interface SeoCustomDashboard {
  description: string;
  id: string;
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
}

export interface SeoCsvFeed {
  description: string;
  id: string;
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
type ServiceSlug = keyof typeof queryMap;

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

const queryMap = {
  csv_feeds: makeQueryMapEntry<SeoCsvFeed>({
    query: SeoCsvFeedsByServiceSlugQuery,
    key: 'seoCsvFeedsByServiceSlug',
  }),
  custom_open_cti_dashboards: makeQueryMapEntry<SeoCustomDashboard>({
    query: SeoCustomDashboardsByServiceSlugQuery,
    key: 'seoCustomDashboardsByServiceSlug',
  }),
};
const querySlugMap = {
  csv_feeds: makeSingleQueryMapEntry<SeoCsvFeed>({
    query: SeoCsvFeedBySlugQuery,
    key: 'seoCsvFeedBySlug',
  }),
  custom_open_cti_dashboards: makeSingleQueryMapEntry<SeoCustomDashboard>({
    query: SeoCustomDashboardBySlugQuery,
    key: 'seoCustomDashboardBySlug',
  }),
};

export async function fetchAllDocuments(
  serviceSlug: ServiceSlug
): Promise<SeoCsvFeed[] | SeoCustomDashboard[]> {
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
): Promise<SeoCsvFeed | SeoCustomDashboard> {
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

  const serviceMap: Record<string, ServiceInfo> = {
    csv_feeds: {
      link: `/redirect/csv_feeds?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more CSV Feeds like this in our OpenCTI CSV Feeds Library, available for download on the XTM Hub.',
    },
    custom_open_cti_dashboards: {
      link: `/redirect/custom_dashboards?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.',
    },
  };

  return serviceMap[serviceInstance.slug] ?? undefined;
}
