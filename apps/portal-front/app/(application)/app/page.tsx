'use client';

import * as React from 'react';
import { useEffect } from 'react';
import {
  useLazyLoadQuery,
  useQueryLoader,
  useRefetchableFragment,
} from 'react-relay';
import Loader from '../../../src/components/Loader';
import ServiceList from '../../../src/components/service/ServiceList';
import useMountingLoader from '../../../src/hooks/use-mounting-loader';

import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { ServiceInstanceFilterKeyEnum } from '@generated/models/ServiceInstanceFilterKey.enum';
import RegisterRegisteredPlatformsQueryGraphql, {
  registerRegisteredPlatformsQuery,
} from '@generated/registerRegisteredPlatformsQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { serviceQuery } from '@generated/serviceQuery.graphql';
import { servicesList_services$key } from '@generated/servicesList_services.graphql';

export const dynamic = 'force-dynamic';

const Page: React.FunctionComponent = () => {
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
  const serviceData = data?.serviceInstances?.edges.map(
    (service) => service?.node as serviceList_fragment$data
  );

  // Registered Platforms
  const [queryRefRegisteredPlatforms, loadQueryRegisteredPlatforms] =
    useQueryLoader<registerRegisteredPlatformsQuery>(
      RegisterRegisteredPlatformsQueryGraphql
    );
  useMountingLoader(loadQueryRegisteredPlatforms, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const handleRefresh = () => {
      loadQueryRegisteredPlatforms({}, { fetchPolicy: 'network-only' });
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
