'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import {
  freeTrialSkeletonToServiceInstanceCardData,
  publicServiceInstanceToInstanceCardData,
  registeredPlatformToServiceInstanceCardData,
  userServicesOwnedServiceToInstanceCardData,
} from '@/utils/services';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { useTranslations } from 'next-intl';
import { Suspense, useContext } from 'react';
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
  const { isPersonalSpace } = useContext(PortalContext);
  // Merge and sort by ordering property
  const sortedServices = [
    ...services.map(userServicesOwnedServiceToInstanceCardData),
    ...publicServices.map(publicServiceInstanceToInstanceCardData),
    ...registeredPlatforms.map((platform) =>
      registeredPlatformToServiceInstanceCardData(platform, t)
    ),
  ].sort((a, b) => a!.ordering - b!.ordering);

  const trialInstances = registeredPlatforms.filter(
    (service) =>
      service.deployment_request?.type ===
        DeploymentRequestDeploymentTypeEnum.TRIAL &&
      service.deployment_request.counts_in_orga_quota
  );

  const shouldDisplayFreeTrialSkeleton =
    trialInstances.length === 0 && !isPersonalSpace;

  const freeTrialServiceInstanceDataCard =
    freeTrialSkeletonToServiceInstanceCardData(t);

  if (sortedServices.length > 0) {
    return (
      <Suspense>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l">
          {shouldDisplayFreeTrialSkeleton && (
            <ServiceInstanceCard
              serviceInstance={freeTrialServiceInstanceDataCard}
            />
          )}
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
