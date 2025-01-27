import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_IDENTIFIER,
} from '@/components/service/service.const';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ReactNode } from 'react';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';

interface ServiceCardProps {
  service: serviceList_fragment$data;
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

  const isLinkService =
    service?.service_definition?.identifier ===
    SERVICE_DEFINITION_IDENTIFIER.LINK;
  const isDisabled =
    service?.creation_status === SERVICE_CREATION_STATUS.PENDING;
  const hasUrl = service.links?.[0]?.url;

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
    // If the status is pending, coming soon badge
    // If it's a link service and has no url, show coming soon badge
    if (isDisabled || (isLinkService && !hasUrl))
      return (
        <ServiceTypeBadge
          isPending={true}
          label={t('Service.ComingSoon')}
        />
      );

    // If not a link service, show the regular badge
    if (!isLinkService)
      return (
        <ServiceTypeBadge
          type={service?.service_definition?.identifier}
          label={service?.service_definition?.name ?? ''}
        />
      );

    return service.tags?.map((tag) => (
      <ServiceTypeBadge
        type={service?.service_definition?.identifier}
        label={tag as string}
        key={tag}
      />
    ));
  };

  return (
    <li
      className="border-light flex flex-col rounded border bg-page-background p-l gap-l cursor-pointer aria-disabled:cursor-default aria-disabled:opacity-60"
      aria-disabled={isDisabled}
      onClick={goTo}
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
