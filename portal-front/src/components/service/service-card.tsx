import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { ReactNode } from 'react';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';

interface ServiceCardProps {
  service: serviceList_fragment$data;
  bottomLeftAction: ReactNode;
}
const ServiceCard: React.FunctionComponent<ServiceCardProps> = ({
  service,
  bottomLeftAction,
}) => {
  const t = useTranslations();

  const isLinkService = service.type === 'link';
  const hasUrl = service.links?.[0]?.url;
  const isDisabled = isLinkService && !hasUrl;

  const Badge = () => {
    // If it's not a link service, show the regular badge
    if (!isLinkService)
      return (
        <ServiceTypeBadge
          type={service.type as ServiceTypeBadge}
          label={service.type as string}
        />
      );

    // If it's a link service and has no url, show coming soon badge
    if (!hasUrl)
      return (
        <ServiceTypeBadge
          type={service.type as ServiceTypeBadge}
          label={t('Service.ComingSoon') as ServiceTypeBadge}
        />
      );

    // If it's a link service and has url, show the tags as badges
    return service.tags?.map((tag) => (
      <ServiceTypeBadge
        type={service.type as ServiceTypeBadge}
        label={tag as string}
        key={tag}
      />
    ));
  };

  return (
    <li
      className="border-light flex flex-col relative rounded border bg-page-background p-l gap-l aria-disabled:opacity-60"
      aria-disabled={isDisabled}
      key={service.id}>
      <div className="flex items-center">
        <h3>{service.name}</h3>
      </div>
      <p className="flex-1 txt-sub-content">{service.description}</p>
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
