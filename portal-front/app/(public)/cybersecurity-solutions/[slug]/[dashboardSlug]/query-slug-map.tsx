import { GraphQLTaggedNode } from 'relay-runtime';

import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCsvFeedBySlugQuery from '@generated/seoCsvFeedBySlugQuery.graphql';
import SeoCustomDashboardBySlugQuery from '@generated/seoCustomDashboardBySlugQuery.graphql';

import { SeoCustomDashboard } from '../page';
type QuerySlugMapEntry<TData, TReturn> = {
  query: GraphQLTaggedNode;
  cast: (data: TData) => TReturn;
};
type QuerySlugMap = {
  'csv-feeds': QuerySlugMapEntry<
    { seoCsvFeedBySlug: documentItem_fragment$data },
    documentItem_fragment$data
  >;
  default: QuerySlugMapEntry<
    { seoCustomDashboardBySlug: SeoCustomDashboard },
    SeoCustomDashboard
  >;
};
export const querySlugMap: QuerySlugMap = {
  'csv-feeds': {
    query: SeoCsvFeedBySlugQuery,
    cast: (data) => data.seoCsvFeedBySlug as documentItem_fragment$data,
  },
  default: {
    query: SeoCustomDashboardBySlugQuery,
    cast: (data) => data.seoCustomDashboardBySlug as SeoCustomDashboard,
  },
};
