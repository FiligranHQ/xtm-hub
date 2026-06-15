'use client';

import ServiceInstanceCard, {
  ServiceInstanceCardData,
} from '@/components/service/ServiceInstanceCard';
import { resolvePrivateServiceInstanceLink } from '@/components/service/service-instance-link.util';
import { ReactNode } from 'react';

interface PrivateServiceInstanceCardProps {
  serviceInstance: ServiceInstanceCardData;
  rightAction?: ReactNode;
  className?: string;
}

const PrivateServiceInstanceCard = ({
  serviceInstance,
  rightAction,
  className,
}: PrivateServiceInstanceCardProps) => {
  const link = resolvePrivateServiceInstanceLink({
    url: serviceInstance.url,
    isLinkDisabled: serviceInstance.isLinkDisabled,
  });

  return (
    <ServiceInstanceCard
      serviceInstance={serviceInstance}
      rightAction={rightAction}
      className={className}
      link={link}
    />
  );
};

export default PrivateServiceInstanceCard;
