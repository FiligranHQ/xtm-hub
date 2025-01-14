import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();

  const goTo = () => {
    if (serviceLink) {
      if (serviceLink.startsWith('http')) {
        window.open(serviceLink, '_blank');
        return;
      }
      router.push(serviceLink);
    }
  };

  const Badge = () => {
    if (service.type !== 'link')
      return (
        <ServiceTypeBadge
          type={service.type as ServiceTypeBadge}
          label={service.type as string}
        />
      );

    if (!service.links?.[0]?.url)
      return (
        <ServiceTypeBadge
          type={service.type as ServiceTypeBadge}
          label={t('Service.ComingSoon') as ServiceTypeBadge}
        />
      );

    return service.tags?.split(',').map((tag) => (
      <ServiceTypeBadge
        type={service.type as ServiceTypeBadge}
        label={tag}
        key={tag}
      />
    ));
  };

  return (
    <li
      className={`border-light flex flex-col rounded border bg-page-background p-l gap-l ${service.type === 'link' && !service.links?.[0]?.url ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
      onClick={goTo}
      key={service.id}>
      <div className="flex items-center">
        <h3>{service.name}</h3>
      </div>
      <p className={'flex-1 txt-sub-content'}>{service.description}</p>
      <div className="flex justify-between items-center gap-s flex-row">
        <div>
          <Badge />
        </div>
        {bottomLeftAction}
      </div>
    </li>
  );
};
export default ServiceCard;
