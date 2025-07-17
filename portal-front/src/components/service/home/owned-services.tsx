'use client';

import {
  octiInstanceToServiceInstanceCardData,
  publicServiceInstanceToInstanceCardData,
  userServicesOwnedServiceToInstanceCardData,
} from '@/utils/services';
import { enrollOCTIInstanceListFragment$data } from '@generated/enrollOCTIInstanceListFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';

interface OwnedServicesProps {
  services: userServicesOwned_fragment$data[];
  publicServices: serviceList_fragment$data[];
  octiInstances: enrollOCTIInstanceListFragment$data['octiInstances'];
}

const OwnedServices = ({
  services,
  publicServices,
  octiInstances,
}: OwnedServicesProps) => {
  // Merge and sort by ordering property
  const sortedServices = [
    ...services.map(userServicesOwnedServiceToInstanceCardData),
    ...publicServices.map(publicServiceInstanceToInstanceCardData),
    ...octiInstances.map(octiInstanceToServiceInstanceCardData),
  ].sort((a, b) => a!.ordering - b!.ordering);

  if (sortedServices.length > 0) {
    return (
      <Suspense>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l">
          {sortedServices.map((service) => (
            <ServiceInstanceCard
              key={service.id}
              serviceInstance={service}
            />
          ))}
        </ul>
      </Suspense>
    );
  }

  return null;
};

export default OwnedServices;
