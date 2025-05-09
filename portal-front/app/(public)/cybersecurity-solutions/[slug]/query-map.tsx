import SeoCustomDashboardsByServiceSlugQuery from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import { GraphQLTaggedNode } from 'relay-runtime';

import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCsvFeedsByServiceSlugQuery from '@generated/seoCsvFeedsByServiceSlugQuery.graphql';
import { SeoCustomDashboard } from './page';
type QueryMapEntry<TData, TReturn> = {
  query: GraphQLTaggedNode;
  cast: (data: TData) => TReturn[];
};
type QueryMap = {
  'csv-feeds': QueryMapEntry<
    { seoCsvFeedsByServiceSlug: documentItem_fragment$data[] },
    documentItem_fragment$data
  >;
  default: QueryMapEntry<
    { seoCustomDashboardsByServiceSlug: SeoCustomDashboard[] },
    SeoCustomDashboard
  >;
};
export const queryMap: QueryMap = {
  'csv-feeds': {
    query: SeoCsvFeedsByServiceSlugQuery,
    cast: (data) =>
      data.seoCsvFeedsByServiceSlug as documentItem_fragment$data[],
  },
  default: {
    query: SeoCustomDashboardsByServiceSlugQuery,
    cast: (data) =>
      data.seoCustomDashboardsByServiceSlug as SeoCustomDashboard[],
  },
};
