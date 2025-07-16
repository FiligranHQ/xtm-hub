'use client';

import { enrollOCTIInstanceFragment$data } from '@generated/enrollOCTIInstanceFragment.graphql';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';

interface OwnedServicesProps {
  services: userServicesOwned_fragment$data[];
  publicServices: serviceList_fragment$data[];
  octiInstances: enrollOCTIInstanceFragment$data[];
}

const octiInstanceToServiceListFragment = (
  instance: enrollOCTIInstanceFragment$data
) => {
  return {
    id: instance.id,
    name: instance.title,
    description: instance.contract,
    illustration_document_id: null,
    logo_document_id: null,
    service_definition: {
      identifier: ServiceDefinitionIdentifierEnum.OCTI_ENROLLMENT,
    },
    links: [
      {
        url: instance.url,
        name: instance.url,
      },
    ],
    ordering: -1, // OCTI Instances are displayed at the first position
  } as unknown as serviceList_fragment$data;
};

const OwnedServices = ({
  services,
  publicServices,
  octiInstances,
}: OwnedServicesProps) => {
  // Merge and sort by ordering property
  const sortedServices = [
    ...services.map(
      ({ subscription }) =>
        subscription!.service_instance as serviceList_fragment$data
    ),
    ...publicServices,
    ...octiInstances.map(octiInstanceToServiceListFragment),
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
