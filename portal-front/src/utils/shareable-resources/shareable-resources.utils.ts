import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';

import { fromGlobalId } from '@/utils/globalId';
import { queryMap, querySlugMap } from './shareable-resources.consts';
import {
  SeoResource,
  ServiceInfo,
  ServiceSlug,
  ShareableResource,
} from './shareable-resources.types';

export async function fetchAllDocuments(
  serviceSlug: ServiceSlug
): Promise<SeoResource[]> {
  const config = queryMap[serviceSlug];
  const response = await serverFetchGraphQL(
    config.query,
    { serviceSlug },
    { cache: 'force-cache' }
  );
  return config.cast(response.data);
}

export async function fetchSingleDocument(
  serviceSlug: ServiceSlug,
  slug: string
): Promise<ShareableResource> {
  const config = querySlugMap[serviceSlug];
  const response = await serverFetchGraphQL(
    config.query,
    { slug },
    { cache: 'force-cache' }
  );
  return config.cast(response.data);
}

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
  };

  return serviceMap[serviceInstance.slug];
}
