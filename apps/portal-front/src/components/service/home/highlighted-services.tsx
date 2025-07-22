'use client';

import { cn } from '@/lib/utils';
import {
  publicServiceInstanceToInstanceCardData,
  userServicesOwnedServiceToInstanceCardData,
} from '@/utils/services';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';
import useGetAction from './hooks/useGetAction';

interface HighlightedServicesProps {
  ownedServices: userServicesOwned_fragment$data[];
  publicServices: serviceList_fragment$data[];
  addSubscriptionInDb: (service: serviceList_fragment$data) => void;
}

const HighlightedServices = ({
  addSubscriptionInDb,
  ownedServices,
  publicServices,
}: HighlightedServicesProps) => {
  const { getAction } = useGetAction(addSubscriptionInDb);

  if (ownedServices.length > 0 || publicServices.length > 0)
    return (
      <Suspense>
        <ul
          className={
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l mb-12'
          }>
          {ownedServices.map((service) => {
            return (
              <ServiceInstanceCard
                key={service.id}
                serviceInstance={userServicesOwnedServiceToInstanceCardData(
                  service
                )}
                className={cn(
                  "before:content-[''] before:bg-white before:absolute before:-inset-1 before:bg-gradient-to-r before:from-[#001BDA] before:to-[#0FBCFF] dark:from-[#0FBCFF] dark:to-[#00F1BD] before:blur-lg before:opacity-75 before:-z-1 before:rounded-lg",
                  "after:content-[''] after:bg-page-background after:inset-0 after:absolute after:z-0 after:rounded-lg"
                )}
              />
            );
          })}
          {publicServices.map((service) => {
            return (
              <ServiceInstanceCard
                key={service.id}
                rightAction={getAction(service)}
                serviceInstance={publicServiceInstanceToInstanceCardData(
                  service
                )}
                className={cn(
                  "before:content-[''] before:bg-white before:absolute before:-inset-1 before:bg-gradient-to-r before:from-[#001BDA] before:to-[#0FBCFF] dark:from-[#0FBCFF] dark:to-[#00F1BD] before:blur-lg before:opacity-75 before:-z-1 before:rounded-lg",
                  "after:content-[''] after:bg-page-background after:inset-0 after:absolute after:-z-1 after:rounded-lg"
                )}
              />
            );
          })}
        </ul>
      </Suspense>
    );
};

export default HighlightedServices;
