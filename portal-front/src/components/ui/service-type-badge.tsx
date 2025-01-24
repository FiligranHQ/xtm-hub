import { cn } from '@/lib/utils';
import { Badge } from 'filigran-ui';
import { FunctionComponent } from 'react';

export type ServiceTypeBadge = 'PENDING' | 'Vault' | 'Links';

const BADGE_COLORS = {
  PENDING: 'text-green',
  Vault: 'text-orange',
  Links: 'text-turquoise',
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
