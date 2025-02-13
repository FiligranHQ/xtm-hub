import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_IDENTIFIER,
} from '@/components/service/service.const';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { ReactNode } from 'react';

interface ServiceInstanceCardProps {
  serviceInstance: serviceList_fragment$data;
  rightLeftAction: ReactNode;
}
const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightLeftAction }) => {
  const t = useTranslations();

  const isLinkService =
    serviceInstance?.service_definition?.identifier ===
    SERVICE_DEFINITION_IDENTIFIER.LINK;
  const isPending =
    serviceInstance?.creation_status === SERVICE_CREATION_STATUS.PENDING;
  const hasUrl = serviceInstance.links?.[0]?.url;

  const Badge = () => {
    // If the status is pending, coming soon badge
    // If it's a link service and has no url, show coming soon badge
    if (isPending || (isLinkService && !hasUrl))
      return (
        <ServiceTypeBadge
          isPending={true}
          label={t('Service.ComingSoon')}
        />
      );

    // If there are no tags, show the service type badge
    if (!serviceInstance.tags || serviceInstance.tags.length === 0)
      return (
        <ServiceTypeBadge
          type={serviceInstance?.service_definition?.identifier}
          label={serviceInstance?.service_definition?.name ?? ''}
        />
      );

    return serviceInstance.tags?.map((tag) => (
      <ServiceTypeBadge
        type={serviceInstance?.service_definition?.identifier}
        label={tag as string}
        key={tag}
      />
    ));
  };

  return (
    <li
      className="border-light flex flex-col relative rounded border bg-page-background p-l gap-l aria-disabled:opacity-60"
      aria-disabled={isPending}>
      <div className="flex items-center">
        <h3>{serviceInstance.name}</h3>
      </div>
      <p className="flex-1 txt-sub-content">{serviceInstance.description}</p>
      <div className="flex justify-between items-center gap-s flex-row">
        <div>
          <Badge />
        </div>
        {rightLeftAction}
      </div>
    </li>
  );
};
export default ServiceInstanceCard;
