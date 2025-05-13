import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery$data,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import { ConcreteRequest } from 'relay-runtime';

import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCsvFeedsByServiceSlugQuery, {
  seoCsvFeedsByServiceSlugQuery$data,
} from '@generated/seoCsvFeedsByServiceSlugQuery.graphql';
import { SeoCustomDashboard } from './page';
type QueryMapEntry<TReturn> = {
  query: ConcreteRequest;
  cast: (data: unknown) => TReturn[];
};
export type QueryMap = {
  'csv-feeds': QueryMapEntry<documentItem_fragment$data>;

  'custom-open-cti-dashboards': QueryMapEntry<SeoCustomDashboard>;
  default: QueryMapEntry<SeoCustomDashboard>;
};
export const queryMap: QueryMap = {
  'csv-feeds': {
    query: SeoCsvFeedsByServiceSlugQuery,
    cast: (data: unknown) =>
      (data as seoCsvFeedsByServiceSlugQuery$data)
        .seoCsvFeedsByServiceSlug as unknown as documentItem_fragment$data[],
  },
  'custom-open-cti-dashboards': {
    query: SeoCustomDashboardsByServiceSlugQuery,
    cast: (data: unknown) =>
      (data as seoCustomDashboardsByServiceSlugQuery$data)
        .seoCustomDashboardsByServiceSlug as unknown as SeoCustomDashboard[],
  },
  default: {
    query: SeoCustomDashboardsByServiceSlugQuery,
    cast: (data: unknown) =>
      (data as seoCustomDashboardsByServiceSlugQuery$data)
        .seoCustomDashboardsByServiceSlug as unknown as SeoCustomDashboard[],
  },
};
