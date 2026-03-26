import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { hasProperty } from '../../hasProperty';
import { serviceConfigMap } from '../shareable-resources.consts';
import { ServiceInfo, ServiceSlug } from '../shareable-resources.types';

export function getServiceInfo(
  serviceInstance: { id: string; slug: ServiceSlug },
  documentId: string
): ServiceInfo | undefined {
  const config = serviceConfigMap[serviceInstance.slug];

  if (!config) {
    return undefined;
  }

  return {
    link: `/redirect/${config.redirectPath}?service_instance_id=${serviceInstance.id}&document_id=${documentId}`,
    description: config.description,
  };
}

export const docHasMetadata = <T, K extends string>(
  documentData: T,
  metadataKey: K
): documentData is T & Record<K, unknown> =>
  hasProperty<T, K, unknown>(documentData, metadataKey) &&
  documentData[metadataKey] !== null &&
  documentData[metadataKey] !== undefined;

export const isResourceDownloadable = (
  document: documentItem_fragment$data | publicDocumentItemFragment$data
): boolean => {
  return (
    document.integration_type !== IntegrationTypeEnum.THIRD_PARTY_INTEGRATION
  );
};
