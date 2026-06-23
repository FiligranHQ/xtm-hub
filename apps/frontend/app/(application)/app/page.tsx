'use client';

import Loader from '@/components/Loader';
import ServiceList from '@/components/service/ServiceList';
import useMountingLoader from '@/hooks/use-mounting-loader';
import { useEffect } from 'react';
import {
  useLazyLoadQuery,
  useQueryLoader,
  useRefetchableFragment,
} from 'react-relay';

import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceFilterKeyEnum } from '@generated/models/ServiceInstanceFilterKey.enum';
import RegisterRegisteredPlatformsQueryGraphql, {
  registerRegisteredPlatformsQuery,
} from '@generated/registerRegisteredPlatformsQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { serviceQuery } from '@generated/serviceQuery.graphql';
import { servicesList_services$key } from '@generated/servicesList_services.graphql';

export const dynamic = 'force-dynamic';

const Page = () => {
  // Get services
  const queryDataServiceInstances = useLazyLoadQuery<serviceQuery>(
    ServiceListQuery,
    {
      count: 50,
      orderBy: 'name',
      orderMode: 'asc',
      searchTerm: '',
      filters: [
        {
          key: ServiceInstanceFilterKeyEnum.PUBLIC,
          value: ['true'],
        },
      ],
    }
  );
  const [data] = useRefetchableFragment<
    serviceQuery,
    servicesList_services$key
  >(servicesListFragment, queryDataServiceInstances);
  // TODO: feature flag OPENCTI_CUSTOM_VIEWS - remove with the feature
  const isCustomViewsEnabled = useIsFeatureEnabled(
    FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS
  );
  const serviceData = data?.serviceInstances?.edges
    .map((service) => service?.node as serviceList_fragment$data)
    .filter(
      (service) =>
        isCustomViewsEnabled ||
        service?.service_definition?.identifier !==
          ServiceDefinitionIdentifierEnum.OPENCTI_CUSTOM_VIEWS
    );

  // Registered Platforms
  const [queryRefRegisteredPlatforms, loadQueryRegisteredPlatforms] =
    useQueryLoader<registerRegisteredPlatformsQuery>(
      RegisterRegisteredPlatformsQueryGraphql
    );
  useMountingLoader(loadQueryRegisteredPlatforms, { input: {} });

  useEffect(() => {
    const handleRefresh = () => {
      loadQueryRegisteredPlatforms(
        { input: {} },
        { fetchPolicy: 'network-only' }
      );
    };

    window.addEventListener('refresh-registered-platforms', handleRefresh);

    return () => {
      window.removeEventListener('refresh-registered-platforms', handleRefresh);
    };
  }, [loadQueryRegisteredPlatforms]);

  if (!queryRefRegisteredPlatforms || !queryDataServiceInstances)
    return <Loader />;

  return (
    <ServiceList
      queryRefRegisteredPlatforms={queryRefRegisteredPlatforms}
      serviceData={serviceData}
    />
  );
};

// Component export
export default Page;
