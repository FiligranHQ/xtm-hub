import { fromGlobalId } from '@/utils/globalId';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { hasProperty } from '../../hasProperty';
import {
  ServiceInfo,
  ServiceSlug,
  ShareableResource,
} from '../shareable-resources.types';

export function getServiceInfo(
  serviceInstance: { id: string; slug: ServiceSlug },
  documentId: string
): ServiceInfo | undefined {
  const serviceId = fromGlobalId(serviceInstance.id).id;

  const serviceMap: Record<ServiceSlug, ServiceInfo> = {
    [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]: {
      link: `/redirect/csv_feeds?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more OpenCTI integration feeds like this in our OpenCTI Integration Feeds Library, available for download on the XTM Hub.',
    },
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: {
      link: `/redirect/custom_dashboards?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more dashboards like this in our OpenCTI Custom Dashboards Library, available for download on the XTM Hub.',
    },
    [ServiceSlug.OPEN_BAS_SCENARIOS]: {
      link: `/redirect/custom_widgets?service_instance_id=${serviceId}&document_id=${documentId}`,
      description:
        '. Discover more widgets like this in our OpenBAS Scenarios Library, available for download on the XTM Hub.',
    },
  };

  return serviceMap[serviceInstance.slug];
}

export const isCustomDashboard = (
  document: ShareableResource
): document is customDashboardsItem_fragment$data => {
  return document.type === 'custom_dashboard';
};

export const docHasMetadata = <T, K extends string>(
  documentData: T,
  metadataKey: K
): documentData is T & Record<K, string> =>
  hasProperty<T, K, string>(documentData, metadataKey);
