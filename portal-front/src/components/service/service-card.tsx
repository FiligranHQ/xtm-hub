import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_NAME,
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
    service?.service_definition?.name === SERVICE_DEFINITION_NAME.LINKS;
  const isDisabled =
    service?.creation_status === SERVICE_CREATION_STATUS.PENDING;

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
    if (isDisabled)
      return (
        <ServiceTypeBadge
          type={service.creation_status as ServiceTypeBadge}
          label={t('Service.ComingSoon') as ServiceTypeBadge}
        />
      );

    // If not a link service, show the regular badge
    if (!isLinkService)
      return (
        <ServiceTypeBadge
          type={service?.service_definition?.name as ServiceTypeBadge}
          label={service?.service_definition?.name as string}
        />
      );

    // If it's a link service and has url, show the tags as badges
    return service.tags?.map((tag) => (
      <ServiceTypeBadge
        type={SERVICE_DEFINITION_NAME.LINKS as ServiceTypeBadge}
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
