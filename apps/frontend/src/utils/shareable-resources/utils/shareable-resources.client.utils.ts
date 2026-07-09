import { hasProperty } from '@/utils/has-property';
import { serviceConfigMap } from '@/utils/shareable-resources/shareable-resources.consts';
import {
  PublicDocumentData,
  ServiceInfo,
  ServiceSlug,
} from '@/utils/shareable-resources/shareable-resources.types';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationType } from '@graphql/generated';

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
  document: documentItem_fragment$data | PublicDocumentData
): boolean => {
  return document.integration_type !== IntegrationType.ThirdPartyIntegration;
};
