import SeoCsvFeedBySlugQuery from '@generated/seoCsvFeedBySlugQuery.graphql';
import SeoCsvFeedsByServiceSlugQuery from '@generated/seoCsvFeedsByServiceSlugQuery.graphql';
import SeoCustomDashboardBySlugQuery from '@generated/seoCustomDashboardBySlugQuery.graphql';
import SeoCustomDashboardsByServiceSlugQuery from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import SeoObasScenarioBySlugQuery from '@generated/seoObasScenarioBySlugQuery.graphql';
import SeoObasScenariosByServiceSlugQuery from '@generated/seoObasScenariosByServiceSlugQuery.graphql';
import {
  MakeQueryMapParams,
  QueryMapEntry,
  SeoCsvFeed,
  SeoCustomDashboard,
  SeoOpenAEVScenario,
  SeoResource,
  ServiceSlug,
} from './shareable-resources.types';

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

export const localeMap: Record<ServiceSlug, string> = {
  [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]: 'CsvFeed',
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: 'CustomDashboards',
  [ServiceSlug.OPEN_BAS_SCENARIOS]: 'ObasScenario',
};

export const queryMap: Record<ServiceSlug, QueryMapEntry<SeoResource[]>> = {
  [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]: makeQueryMapEntry<SeoCsvFeed>({
    query: SeoCsvFeedsByServiceSlugQuery,
    key: 'seoCsvFeedsByServiceSlug',
  }),
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
    makeQueryMapEntry<SeoCustomDashboard>({
      query: SeoCustomDashboardsByServiceSlugQuery,
      key: 'seoCustomDashboardsByServiceSlug',
    }),
  [ServiceSlug.OPEN_BAS_SCENARIOS]: makeQueryMapEntry<SeoOpenAEVScenario>({
    query: SeoObasScenariosByServiceSlugQuery,
    key: 'seoOpenAEVScenariosByServiceSlug',
  }),
};

export const querySlugMap: Record<ServiceSlug, QueryMapEntry<SeoResource>> = {
  [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]: makeSingleQueryMapEntry<SeoCsvFeed>(
    {
      query: SeoCsvFeedBySlugQuery,
      key: 'seoCsvFeedBySlug',
    }
  ),
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
    makeSingleQueryMapEntry<SeoCustomDashboard>({
      query: SeoCustomDashboardBySlugQuery,
      key: 'seoCustomDashboardBySlug',
    }),
  [ServiceSlug.OPEN_BAS_SCENARIOS]: makeSingleQueryMapEntry<SeoOpenAEVScenario>(
    {
      query: SeoObasScenarioBySlugQuery,
      key: 'seoOpenAEVScenarioBySlug',
    }
  ),
};
