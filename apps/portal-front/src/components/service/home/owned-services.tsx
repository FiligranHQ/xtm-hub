'use client';

import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import {
  freeTrialSkeletonToServiceInstanceCardData,
  publicServiceInstanceToInstanceCardData,
  registeredPlatformToServiceInstanceCardData,
  userServicesOwnedServiceToInstanceCardData,
} from '@/utils/services';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
  const { availableTrials } = useOrgaFreeTrial();

  // Merge and sort by ordering property
  const sortedServices = [
    ...services.map(userServicesOwnedServiceToInstanceCardData),
    ...publicServices.map(publicServiceInstanceToInstanceCardData),
    ...registeredPlatforms.map((platform) =>
      registeredPlatformToServiceInstanceCardData(platform, t)
    ),
  ].sort((a, b) => a!.ordering - b!.ordering);

  const freeTrialsSkeletonDataCards = availableTrials
    .filter(
      (platformIdentifier) =>
        platformIdentifier !== PlatformIdentifierEnum.OPENAEV
    )
    .map((platformIdentifier) =>
      freeTrialSkeletonToServiceInstanceCardData(
        platformIdentifier as PlatformIdentifierEnum,
        t
      )
    );

  if (sortedServices.length > 0) {
    return (
      <Suspense>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l">
          {freeTrialsSkeletonDataCards.map((card, index) => (
            <ServiceInstanceCard
              key={`${card.id}-${index}`}
              serviceInstance={card}
            />
          ))}
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
