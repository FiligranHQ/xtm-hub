'use client';

import ServiceInstanceCard, {
  ServiceInstanceCardData,
} from '@/components/service/ServiceInstanceCard';
import { resolvePublicServiceInstanceLink } from '@/components/service/service-instance-link.util';
import { useTolgee } from '@tolgee/react';
import { ReactNode } from 'react';

interface PublicServiceInstanceCardProps {
  serviceInstance: ServiceInstanceCardData;
  rightAction?: ReactNode;
  className?: string;
}

const PublicServiceInstanceCard = ({
  serviceInstance,
  rightAction,
  className,
}: PublicServiceInstanceCardProps) => {
  const { language: locale } = useTolgee(['language']);
  const link = resolvePublicServiceInstanceLink({
    url: serviceInstance.url,
    isLinkDisabled: serviceInstance.isLinkDisabled,
    locale,
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

export default PublicServiceInstanceCard;
