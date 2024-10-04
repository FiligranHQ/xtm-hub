import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import * as React from 'react';
import { ReactNode } from 'react';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';

interface ServiceCardProps {
  service: serviceList_fragment$data;
  topRightAction: ReactNode | null;
  bottomLeftAction: ReactNode;
}
const ServiceCard: React.FunctionComponent<ServiceCardProps> = ({
  service,
  topRightAction,
  bottomLeftAction,
}) => {
  return (
    <li
      className="border-light flex flex-col rounded border bg-page-background p-l gap-l"
      key={service.id}>
      <div className=" flex justify-between items-center gap-s">
        <h3>{service.name}</h3>
        {topRightAction}
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
