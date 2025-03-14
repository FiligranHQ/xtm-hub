'use client';

import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { Separator } from 'filigran-ui';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';
import useGetAction from './hooks/useGetAction';

interface PublicServicesProps {
  services: serviceList_fragment$data[];
  addSubscriptionInDb: (service: serviceList_fragment$data) => void;
}

const AvailableServices = ({
  addSubscriptionInDb,
  services,
}: PublicServicesProps) => {
  const { getAction } = useGetAction(addSubscriptionInDb);

  if (services.length > 0)
    return (
      <Suspense>
        <Separator className="my-12" />
        <ul
          className={
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l'
          }>
          {services.map((service) => {
            return (
              !service.user_joined && (
                <ServiceInstanceCard
                  key={service.id}
                  rightAction={getAction(service)}
                  serviceInstance={service}
                />
              )
            );
          })}
        </ul>
      </Suspense>
    );
};

export default AvailableServices;
