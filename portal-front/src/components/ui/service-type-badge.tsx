import { cn } from '@/lib/utils';
import { Badge } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';

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
    Feed: 'text-yellow-500',
    Analysis: 'text-turquoise',
  };
  return <Badge className={cn('uppercase', badgeColor[type])}>{type}</Badge>;
};
