import { resolveHomepageRoadmapResolution } from '@/components/homepage/Homepage.utils';
import XtmRoadmap from '@/components/homepage/XtmRoadmap';
import type { PublicLocale } from '@/i18n/config';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import ServiceInstancesListQuery, {
  serviceInstancesListQuery,
} from '@generated/serviceInstancesListQuery.graphql';
import {
  OrderingMode,
  ServiceDefinitionIdentifier,
  ServiceInstanceFilterKey,
  ServiceInstanceOrdering,
} from '@graphql/generated';

const PRIVATE_ROADMAP_BASE_PATH = '/app/service/xtm_platform_roadmap';

type PrivateHomepageRoadmapSectionProps = {
  locale: PublicLocale;
  registeredIdentifiers: ServiceDefinitionIdentifier[];
};

const PrivateHomepageRoadmapSection = async ({
  locale,
  registeredIdentifiers,
}: PrivateHomepageRoadmapSectionProps) => {
  const response = await serverFetchGraphQL<serviceInstancesListQuery>(
    ServiceInstancesListQuery,
    {
      count: 1,
      cursor: null,
      orderBy: ServiceInstanceOrdering.Name,
      orderMode: OrderingMode.Asc,
      filters: [
        {
          key: ServiceInstanceFilterKey.ServiceDefinitionIdentifier,
          value: [ServiceDefinitionIdentifier.XtmPlatformRoadmap],
        },
      ],
      searchTerm: null,
    }
  );

  const serviceInstanceId = response.data.serviceInstances.edges[0]?.node?.id;

  if (!serviceInstanceId) {
    return null;
  }

  const {
    productFilter: roadmapProductFilter,
    titleProduct: roadmapTitleProduct,
  } = resolveHomepageRoadmapResolution(registeredIdentifiers);
  const roadmapHref = `${PRIVATE_ROADMAP_BASE_PATH}/${encodeURIComponent(serviceInstanceId)}`;
  const seeMoreHref = roadmapProductFilter
    ? `${roadmapHref}?product=${encodeURIComponent(roadmapProductFilter)}`
    : roadmapHref;

  return (
    <XtmRoadmap
      locale={locale}
      seeMoreHref={seeMoreHref}
      titleProduct={roadmapTitleProduct}
    />
  );
};

export default PrivateHomepageRoadmapSection;
