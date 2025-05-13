import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCsvFeedBySlugQuery, {
  seoCsvFeedBySlugQuery$data,
} from '@generated/seoCsvFeedBySlugQuery.graphql';
import SeoCustomDashboardBySlugQuery, {
  seoCustomDashboardBySlugQuery$data,
} from '@generated/seoCustomDashboardBySlugQuery.graphql';
import { ConcreteRequest } from 'relay-runtime';

import { SeoCustomDashboard } from '../page';
type QuerySlugMapEntry<TReturn> = {
  query: ConcreteRequest;
  cast: (data: unknown) => TReturn;
};
export type QuerySlugMap = {
  'csv-feeds': QuerySlugMapEntry<documentItem_fragment$data>;
  'custom-open-cti-dashboards': QuerySlugMapEntry<SeoCustomDashboard>;
  default: QuerySlugMapEntry<SeoCustomDashboard>;
};
export const querySlugMap: QuerySlugMap = {
  'csv-feeds': {
    query: SeoCsvFeedBySlugQuery,
    cast: (data: unknown) =>
      (data as seoCsvFeedBySlugQuery$data)
        .seoCsvFeedBySlug as unknown as documentItem_fragment$data,
  },
  'custom-open-cti-dashboards': {
    query: SeoCustomDashboardBySlugQuery,
    cast: (data: unknown) =>
      (data as seoCustomDashboardBySlugQuery$data)
        .seoCustomDashboardBySlug as unknown as SeoCustomDashboard,
  },
  default: {
    query: SeoCustomDashboardBySlugQuery,
    cast: (data: unknown) =>
      (data as seoCustomDashboardBySlugQuery$data)
        .seoCustomDashboardBySlug as unknown as SeoCustomDashboard,
  },
};
