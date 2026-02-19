import SeoCustomDashboardsByServiceSlugQuery from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import SeoIntegrationsByServiceSlugQuery from '@generated/seoIntegrationsByServiceSlugQuery.graphql';
import SeoOpenaevScenariosByServiceSlugQuery from '@generated/seoOpenaevScenariosByServiceSlugQuery.graphql';
import {
  MakeQueryMapParams,
  QueryMapEntry,
  SeoCustomDashboard,
  SeoIntegration,
  SeoOpenAEVScenario,
  SeoResource,
  ServiceSlug,
} from './shareable-resources.types';

export interface ServiceConfig {
  redirectPath: string;
  description: string;
}

export const serviceConfigMap: Record<ServiceSlug, ServiceConfig> = {
  [ServiceSlug.OPEN_CTI_INTEGRATIONS]: {
    redirectPath: 'opencti_integrations',
    description:
      '. Discover more OpenCTI integrations like this in our OpenCTI Integrations Library, available for download on the XTM Hub.',
  },
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: {
    redirectPath: 'opencti_custom_dashboards',
    description:
      '. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.',
  },
  [ServiceSlug.OPEN_AEV_SCENARIOS]: {
    redirectPath: 'openaev_scenarios',
    description:
      '. Discover more widgets like this in our OpenAEV Scenarios Library, available for download on the XTM Hub.',
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

export const localeMap: Record<ServiceSlug, string> = {
  [ServiceSlug.OPEN_CTI_INTEGRATIONS]: 'OpenctiIntegrations',
  [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: 'OpenctiCustomDashboards',
  [ServiceSlug.OPEN_AEV_SCENARIOS]: 'OpenAEVScenario',
};

export const queryMap: Record<ServiceSlug, QueryMapEntry<SeoResource[]>> = {
  [ServiceSlug.OPEN_CTI_INTEGRATIONS]: makeQueryMapEntry<SeoIntegration>({
    query: SeoIntegrationsByServiceSlugQuery,
    key: 'publicIntegrationsByServiceSlug',
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
