import XtmRoadmap from '@/components/homepage/XtmRoadmap';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceFilterKeyEnum } from '@generated/models/ServiceInstanceFilterKey.enum';
import { ServiceInstanceOrderingEnum } from '@generated/models/ServiceInstanceOrdering.enum';
import ServiceInstancesListQuery, {
  serviceInstancesListQuery,
} from '@generated/serviceInstancesListQuery.graphql';
import { PlatformIdentifier } from '@graphql/generated';

const PRIVATE_ROADMAP_BASE_PATH = '/app/service/xtm_platform_roadmap';

type PrivateHomepageRoadmapSectionProps = {
  platformIdentifiers: PlatformIdentifier[];
};

const PrivateHomepageRoadmapSection = async ({
  platformIdentifiers,
}: PrivateHomepageRoadmapSectionProps) => {
  const response = await serverFetchGraphQL<serviceInstancesListQuery>(
    ServiceInstancesListQuery,
    {
      count: 1,
      cursor: null,
      orderBy: ServiceInstanceOrderingEnum.NAME,
      orderMode: OrderingModeEnum.ASC,
      filters: [
        {
          key: ServiceInstanceFilterKeyEnum.SERVICE_DEFINITION_IDENTIFIER,
          value: [ServiceDefinitionIdentifierEnum.XTM_PLATFORM_ROADMAP],
        },
      ],
      searchTerm: null,
    }
  );

  const serviceInstanceId = response.data.serviceInstances.edges[0]?.node?.id;
  if (!serviceInstanceId) {
    return null;
  }

  const homepageRoadmapTitleProduct =
    platformIdentifiers.length === 1
      ? (platformIdentifiers?.[0] ?? 'default')
      : 'default';

  const roadmapHref = `${PRIVATE_ROADMAP_BASE_PATH}/${encodeURIComponent(serviceInstanceId)}`;
  const seeMoreHref =
    homepageRoadmapTitleProduct !== 'default'
      ? `${roadmapHref}?product=${encodeURIComponent(homepageRoadmapTitleProduct)}`
      : roadmapHref;

  return (
    <XtmRoadmap
      seeMoreHref={seeMoreHref}
      titleProduct={homepageRoadmapTitleProduct}
    />
  );
};

export default PrivateHomepageRoadmapSection;
