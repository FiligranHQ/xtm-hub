import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ReactNode } from 'react';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';

interface ServiceCardProps {
  service: serviceList_fragment$data;
  serviceLink?: string;
  bottomLeftAction: ReactNode;
}
const ServiceCard: React.FunctionComponent<ServiceCardProps> = ({
  service,
  serviceLink,
  bottomLeftAction,
}) => {
  const router = useRouter();
  return (
    <li
      className="border-light flex flex-col rounded border bg-page-background p-l gap-l hover:cursor-pointer"
      onClick={() => router.push(serviceLink ?? '')}
      key={service.id}>
      <div className=" flex items-center">
        <h3>{service.name}</h3>
      </div>
      <p className={'flex-1 txt-sub-content'}>{service.description}</p>
      <div className="flex justify-between items-center gap-s flex-row">
        <ServiceTypeBadge type={service.type as ServiceTypeBadge} />
        {bottomLeftAction}
      </div>
    </li>
  );
};
export default ServiceCard;
