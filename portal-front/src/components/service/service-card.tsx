import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ReactNode } from 'react';
import type { PublicService } from './service.const';

interface ServiceCardProps {
  service: PublicService;
  serviceLink?: string | null;
  bottomLeftAction: ReactNode;
}
const ServiceCard: React.FunctionComponent<ServiceCardProps> = ({
  service,
  serviceLink,
  bottomLeftAction,
}) => {
  const router = useRouter();

  const goTo = () => {
    if (serviceLink) {
      if (serviceLink.startsWith('http')) {
        window.open(serviceLink, '_blank');
        return;
      }
      router.push(serviceLink);
    }
  };

  return (
    <li
      className="border-light flex flex-col rounded border bg-page-background p-l gap-l hover:cursor-pointer"
      onClick={goTo}
      key={service.id}>
      <div className=" flex items-center">
        <h3>{service.name}</h3>
      </div>
      <p className={'flex-1 txt-sub-content'}>{service.description}</p>
      <div className="flex justify-between items-center gap-s flex-row">
        <div>
          {service.type !== 'link' ? (
            <ServiceTypeBadge
              type={service.type as ServiceTypeBadge}
              label={service.type as string}
            />
          ) : (
            service.tags?.split(',').map((tag) => (
              <ServiceTypeBadge
                type={service.type as ServiceTypeBadge}
                label={tag}
                key={tag}
              />
            ))
          )}
        </div>
        {bottomLeftAction}
      </div>
    </li>
  );
};
export default ServiceCard;
