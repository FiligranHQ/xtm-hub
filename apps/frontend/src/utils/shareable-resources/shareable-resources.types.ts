import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import type { publicDocumentByServiceSlugItemFragment$data } from '@generated/publicDocumentByServiceSlugItemFragment.graphql';
import type { publicDocumentBySlugItemFragment$data } from '@generated/publicDocumentBySlugItemFragment.graphql';
import type { publicDocumentListItemFragment$data } from '@generated/publicDocumentListItemFragment.graphql';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';

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

export type ServiceInfo = { link: string; description: string };
export enum ServiceSlug {
  OPEN_CTI_INTEGRATIONS = 'opencti-integrations',
  OPEN_CTI_CUSTOM_DASHBOARDS = 'opencti-custom-dashboards',
  OPEN_CTI_CUSTOM_VIEWS = 'opencti-custom-views',
  OPEN_AEV_SCENARIOS = 'openaev-scenarios',
  OPEN_CTI_PLAYBOOKS = 'opencti-playbooks',
}

export const SHAREABLE_RESOURCE_TYPE_NAME_MAPPING: Record<
  ShareableResourceType,
  string
> = {
  [ShareableResourceType.OPENAEV_SCENARIO]: 'Scenario OpenAEV',
  [ShareableResourceType.OPENCTI_INTEGRATION]: 'Integration OpenCTI',
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: 'Custom Dashboard OpenCTI',
  [ShareableResourceType.OPENCTI_CUSTOM_VIEW]: 'Custom View OpenCTI',
  [ShareableResourceType.OPENCTI_PLAYBOOK]: 'Playbook OpenCTI',
};

export const SHAREABLE_RESOURCE_PRODUCT_MAPPING: Record<
  ShareableResourceType,
  string
> = {
  [ShareableResourceType.OPENAEV_SCENARIO]: 'OpenAEV',
  [ShareableResourceType.OPENCTI_INTEGRATION]: 'OpenCTI',
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: 'OpenCTI',
  [ShareableResourceType.OPENCTI_CUSTOM_VIEW]: 'OpenCTI',
  [ShareableResourceType.OPENCTI_PLAYBOOK]: 'OpenCTI',
};

export const SHAREABLE_RESOURCE_LIBRARY_MAPPING: Record<
  ShareableResourceType,
  string
> = {
  [ShareableResourceType.OPENAEV_SCENARIO]: 'Scenarios',
  [ShareableResourceType.OPENCTI_INTEGRATION]: 'Integrations',
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: 'Custom Dashboards',
  [ShareableResourceType.OPENCTI_CUSTOM_VIEW]: 'Custom Views',
  [ShareableResourceType.OPENCTI_PLAYBOOK]: 'Playbooks',
};

export const SHAREABLE_RESOURCE_SERVICE_DEFINITION_IDENTIFIER_MAPPING: Record<
  ShareableResourceType,
  ServiceDefinitionIdentifierEnum
> = {
  [ShareableResourceType.OPENCTI_INTEGRATION]:
    ServiceDefinitionIdentifierEnum.OPENCTI_INTEGRATIONS,
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]:
    ServiceDefinitionIdentifierEnum.OPENCTI_CUSTOM_DASHBOARDS,
  [ShareableResourceType.OPENCTI_CUSTOM_VIEW]:
    ServiceDefinitionIdentifierEnum.OPENCTI_CUSTOM_VIEWS,
  [ShareableResourceType.OPENAEV_SCENARIO]:
    ServiceDefinitionIdentifierEnum.OPENAEV_SCENARIOS,
  [ShareableResourceType.OPENCTI_PLAYBOOK]:
    ServiceDefinitionIdentifierEnum.OPENCTI_PLAYBOOKS,
};

export const SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING: Record<
  ShareableResourceType,
  ServiceSlug
> = {
  [ShareableResourceType.OPENCTI_INTEGRATION]:
    ServiceSlug.OPEN_CTI_INTEGRATIONS,
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]:
    ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS,
  [ShareableResourceType.OPENAEV_SCENARIO]: ServiceSlug.OPEN_AEV_SCENARIOS,
  [ShareableResourceType.OPENCTI_PLAYBOOK]: ServiceSlug.OPEN_CTI_PLAYBOOKS,
  [ShareableResourceType.OPENCTI_CUSTOM_VIEW]:
    ServiceSlug.OPEN_CTI_CUSTOM_VIEWS,
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
