import SeoCustomDashboardBySlugQuery from '@generated/seoCustomDashboardBySlugQuery.graphql';
import SeoCustomDashboardsByServiceSlugQuery from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import SeoIntegrationFeedByServiceSlugQuery from '@generated/seoIntegrationFeedByServiceSlugQuery.graphql';
import SeoIntegrationFeedBySlugQuery from '@generated/seoIntegrationFeedBySlugQuery.graphql';
import SeoOpenaevScenarioBySlugQuery from '@generated/seoOpenaevScenarioBySlugQuery.graphql';
import SeoOpenaevScenariosByServiceSlugQuery from '@generated/seoOpenaevScenariosByServiceSlugQuery.graphql';
import {
  MakeQueryMapParams,
  QueryMapEntry,
  SeoCustomDashboard,
  SeoIntegrationFeed,
  SeoOpenAEVScenario,
  SeoResource,
  ServiceSlug,
} from './shareable-resources.types';

export interface ServiceConfig {
  redirectPath: string;
  description: string;
}

export const serviceConfigMap: Record<ServiceSlug, ServiceConfig> = {
  [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]: {
    redirectPath: 'opencti_integration_feeds',
    description:
      '. Discover more OpenCTI integration feeds like this in our OpenCTI Integration Feeds Library, available for download on the XTM Hub.',
  },
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: {
    redirectPath: 'opencti_custom_dashboards',
    description:
      '. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.',
  },
  [ServiceSlug.OPEN_BAS_SCENARIOS]: {
    redirectPath: 'openaev_scenarios',
    description:
      '. Discover more widgets like this in our OpenBAS Scenarios Library, available for download on the XTM Hub.',
  },
};

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
  [ServiceSlug.OPEN_AEV_SCENARIOS]: 'OpenAEVScenario',

};

export const queryMap: Record<ServiceSlug, QueryMapEntry<SeoResource[]>> = {
  [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]:
    makeQueryMapEntry<SeoIntegrationFeed>({
      query: SeoIntegrationFeedByServiceSlugQuery,
      key: 'publicIntegrationFeedByServiceSlug',
    }),
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
    makeQueryMapEntry<SeoCustomDashboard>({
      query: SeoCustomDashboardsByServiceSlugQuery,
      key: 'seoCustomDashboardsByServiceSlug',
    }),
  [ServiceSlug.OPEN_AEV_SCENARIOS]: makeQueryMapEntry<SeoOpenAEVScenario>({
    query: SeoOpenaevScenariosByServiceSlugQuery,
    key: 'seoOpenAEVScenariosByServiceSlug',
  }),
};

export const querySlugMap: Record<ServiceSlug, QueryMapEntry<SeoResource>> = {
  [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]:
    makeSingleQueryMapEntry<SeoIntegrationFeed>({
      query: SeoIntegrationFeedBySlugQuery,
      key: 'publicIntegrationFeedBySlug',
    }),
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
    makeSingleQueryMapEntry<SeoCustomDashboard>({
      query: SeoCustomDashboardBySlugQuery,
      key: 'seoCustomDashboardBySlug',
    }),
  [ServiceSlug.OPEN_AEV_SCENARIOS]: makeSingleQueryMapEntry<SeoOpenAEVScenario>(
    {
      query: SeoOpenaevScenarioBySlugQuery,
      key: 'seoOpenAEVScenarioBySlug',
    }
  ),
};
