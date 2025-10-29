'use client';

import SkeletonServiceCard from '@/components/service/home/skeleton-service-card';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import {
  hasTrialInstance,
  publicServiceInstanceToInstanceCardData,
  registeredPlatformToServiceInstanceCardData,
  userServicesOwnedServiceToInstanceCardData,
} from '@/utils/services';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';

interface OwnedServicesProps {
  services: userServicesOwned_fragment$data[];
  publicServices: serviceList_fragment$data[];
  registeredPlatforms: registerRegisteredPlatformListFragment$data['registeredPlatforms'];
}

const OwnedServices = ({
  services,
  publicServices,
  registeredPlatforms,
}: OwnedServicesProps) => {
  const isFreeTrialFeatureEnabled = useIsFeatureEnabled(
    FeatureFlag.OPEN_CTI_FREE_TRIAL
  );
  // Merge and sort by ordering property
  const sortedServices = [
    ...services
      .filter(
        (service) =>
          service.subscription?.service_instance?.service_definition
            ?.identifier !==
          ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION
      )
      .map(userServicesOwnedServiceToInstanceCardData),
    ...publicServices.map(publicServiceInstanceToInstanceCardData),
    ...registeredPlatforms.map(registeredPlatformToServiceInstanceCardData),
  ].sort((a, b) => a!.ordering - b!.ordering);

  if (sortedServices.length > 0) {
    return (
      <Suspense>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l">
          {isFreeTrialFeatureEnabled &&
            !hasTrialInstance(
              registeredPlatforms.map(
                registeredPlatformToServiceInstanceCardData
              )
            ) && <SkeletonServiceCard />}
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
