import { Badge } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';
import { cn } from '@/lib/utils';

export type ServiceTypeBadge = 'COMMUNITY' | 'Intel' | 'Feed' | 'Analysis';

interface ServiceTypeBadgeProps {
  type: ServiceTypeBadge;
}
export const ServiceTypeBadge: FunctionComponent<ServiceTypeBadgeProps> = ({
  type,
}) => {
  const badgeColor = {
    COMMUNITY: 'text-green',
    Intel: 'text-orange',
    Feed: 'text-red-800',
    Analysis: 'text-turquoise',
  };
  return <Badge className={cn('uppercase', badgeColor[type])}>{type}</Badge>;
};
