import { cn } from '@/lib/utils';
import { Badge } from 'filigran-ui';
import { FunctionComponent } from 'react';

export type ServiceTypeBadge = 'COMMUNITY' | 'Intel' | 'Feed' | 'Analysis';

const BADGE_COLORS = {
  COMMUNITY: 'text-green',
  Intel: 'text-orange',
  Feed: 'text-yellow-500',
  Analysis: 'text-turquoise',
};

interface ServiceTypeBadgeProps {
  type: ServiceTypeBadge;
  label: string;
}

export const ServiceTypeBadge: FunctionComponent<ServiceTypeBadgeProps> = ({
  type,
  label,
}) => {
  return <Badge className={cn('uppercase', BADGE_COLORS[type])}>{label}</Badge>;
};
