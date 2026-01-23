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
): documentData is T & Record<K, string> =>
  hasProperty<T, K, string>(documentData, metadataKey) &&
  !!documentData[metadataKey];
