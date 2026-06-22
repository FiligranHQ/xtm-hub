import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import type { publicDocumentByServiceSlugItemFragment$data } from '@generated/publicDocumentByServiceSlugItemFragment.graphql';
import type { publicDocumentBySlugItemFragment$data } from '@generated/publicDocumentBySlugItemFragment.graphql';
import type { publicDocumentListItemFragment$data } from '@generated/publicDocumentListItemFragment.graphql';

export type PublicDocumentData =
  | publicDocumentListItemFragment$data
  | publicDocumentByServiceSlugItemFragment$data
  | publicDocumentBySlugItemFragment$data;

export type PublicDocumentDetailsData =
  | publicDocumentByServiceSlugItemFragment$data
  | publicDocumentBySlugItemFragment$data;

export enum ShareableResourceType {
  OPENAEV_SCENARIO = 'openaev_scenario',
  OPENCTI_INTEGRATION = 'opencti_integration',
  OPENCTI_CUSTOM_DASHBOARD = 'opencti_custom_dashboard',
  OPENCTI_CUSTOM_VIEW = 'opencti_custom_view',
  OPENCTI_PLAYBOOK = 'opencti_playbook',
}

export const SHAREABLE_RESOURCE_TYPE_NAME_MAPPING = {
  openaev_scenario: 'Scenario OpenAEV',
  opencti_integration: 'Feed OpenCTI',
  opencti_custom_dashboard: 'Custom Dashboard OpenCTI',
  opencti_custom_view: 'Custom View OpenCTI',
  opencti_playbook: 'Playbook OpenCTI',
};

export const isIntegrationItem = (
  resource: documentItem_fragment$data | PublicDocumentData
): boolean => {
  return resource.type === ShareableResourceType.OPENCTI_INTEGRATION;
};

export const isConnectorResource = (
  resource: documentItem_fragment$data | PublicDocumentData
): boolean => {
  return resource.__typename === 'Connector';
};

export type ServiceInfo = { link: string; description: string };
export enum ServiceSlug {
  OPEN_CTI_INTEGRATIONS = 'opencti-integrations',
  OPEN_CTI_CUSTOM_DASHBOARDS = 'opencti-custom-dashboards',
  OPEN_CTI_CUSTOM_VIEWS = 'opencti-custom-views',
  OPEN_AEV_SCENARIOS = 'openaev-scenarios',
  OPEN_CTI_PLAYBOOKS = 'opencti-playbooks',
}
