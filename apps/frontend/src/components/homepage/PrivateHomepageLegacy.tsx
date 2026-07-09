'use client';
import { ServiceInstanceFilterKey } from '@graphql/generated';

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
import RegisterRegisteredPlatformsQueryGraphql, {
  registerRegisteredPlatformsQuery,
} from '@generated/registerRegisteredPlatformsQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { serviceQuery } from '@generated/serviceQuery.graphql';
import { servicesList_services$key } from '@generated/servicesList_services.graphql';

export const PrivateHomepageLegacy = () => {
  const queryDataServiceInstances = useLazyLoadQuery<serviceQuery>(
    ServiceListQuery,
    {
      count: 50,
      orderBy: 'name',
      orderMode: 'asc',
      searchTerm: '',
      filters: [
        {
          key: ServiceInstanceFilterKey.Public,
          value: ['true'],
        },
      ],
    }
  );
  const [data] = useRefetchableFragment<
    serviceQuery,
    servicesList_services$key
  >(servicesListFragment, queryDataServiceInstances);
  const serviceData = data?.serviceInstances?.edges.map(
    (service) => service?.node as serviceList_fragment$data
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
