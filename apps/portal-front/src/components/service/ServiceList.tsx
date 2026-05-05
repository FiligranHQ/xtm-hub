'use client';

import { RegisterRegisteredPlatformsQuery } from '@/components/registration/register/register.graphql';
import ServiceInstanceCard from '@/components/service/ServiceInstanceCard';
import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import {
  freeTrialSkeletonToServiceInstanceCardData,
  publicServiceInstanceToInstanceCardData,
  registeredPlatformToServiceInstanceCardData,
} from '@/utils/services';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import registerRegisteredPlatformListFragmentGraphql, {
  registerRegisteredPlatformListFragment$key,
} from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface ServiceProps {
  queryRefRegisteredPlatforms: PreloadedQuery<registerRegisteredPlatformsQuery>;
  serviceData: serviceList_fragment$data[];
}

const ServiceList = ({
  queryRefRegisteredPlatforms,
  serviceData,
}: ServiceProps) => {
  const t = useTranslations();
  const { availableTrials } = useOrgaFreeTrial();

  const queryData = usePreloadedQuery<registerRegisteredPlatformsQuery>(
    RegisterRegisteredPlatformsQuery,
    queryRefRegisteredPlatforms
  );

  const [registeredPlatformsData] = useRefetchableFragment<
    registerRegisteredPlatformsQuery,
    registerRegisteredPlatformListFragment$key
  >(registerRegisteredPlatformListFragmentGraphql, queryData);

  const freeTrialsSkeletonDataCards = availableTrials.map(
    (platformIdentifier) =>
      freeTrialSkeletonToServiceInstanceCardData(
        platformIdentifier as PlatformIdentifierEnum,
        t
      )
  );

  const sortedServices = useMemo(() => {
    const registeredPlatforms =
      registeredPlatformsData.registeredPlatforms ?? [];

    return [
      ...freeTrialsSkeletonDataCards,
      ...registeredPlatforms.map((platform) =>
        registeredPlatformToServiceInstanceCardData(platform, t)
      ),
      ...serviceData.map(publicServiceInstanceToInstanceCardData),
    ].sort((a, b) => a!.ordering - b!.ordering);
  }, [
    freeTrialsSkeletonDataCards,
    registeredPlatformsData.registeredPlatforms,
    serviceData,
    t,
  ]);

  return (
    <>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l'
        }>
        {sortedServices.map((service, index) => {
          return (
            <ServiceInstanceCard
              key={`${service.id}-${index}`}
              serviceInstance={service}
            />
          );
        })}
      </ul>
    </>
  );
};

export default ServiceList;
