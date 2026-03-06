import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';

export enum ShareableResourceType {
  OPENAEV_SCENARIO = 'openaev_scenario',
  OPENCTI_INTEGRATION = 'opencti_integration',
  OPENCTI_CUSTOM_DASHBOARD = 'opencti_custom_dashboard',
}

export const SHAREABLE_RESOURCE_TYPE_NAME_MAPPING = {
  openaev_scenario: 'Scenario OpenAEV',
  opencti_integration: 'Feed OpenCTI',
  opencti_custom_dashboard: 'Custom Dashboard OpenCTI',
};

export const isIntegrationItem = (
  resource: documentItem_fragment$data | publicDocumentItemFragment$data
): boolean => {
  return resource.type === ShareableResourceType.OPENCTI_INTEGRATION;
};

export const isConnectorResource = (
  resource: documentItem_fragment$data | publicDocumentItemFragment$data
): boolean => {
  return resource.__typename === 'Connector';
};

export const hasResourceLogo = (
  resource: documentItem_fragment$data | publicDocumentItemFragment$data
): boolean => {
  if (!resource.integration_type) {
    return false;
  }

  return [
    IntegrationTypeEnum.CONNECTOR,
    IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
  ].includes(resource.integration_type as IntegrationTypeEnum);
};

export type ServiceInfo = { link: string; description: string };
export enum ServiceSlug {
  OPEN_CTI_INTEGRATIONS = 'opencti-integrations',
  OPEN_CTI_CUSTOM_DASHBOARDS = 'opencti-custom-dashboards',
  OPEN_AEV_SCENARIOS = 'openaev-scenarios',
}
