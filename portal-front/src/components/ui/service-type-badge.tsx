import { cn } from '@/lib/utils';
import { Badge } from 'filigran-ui';
import { FunctionComponent } from 'react';
import { ServiceDefinitionIdentifier } from '../../../__generated__/serviceList_fragment.graphql';

type RealServiceDefinitionIdentifier =
  | Exclude<ServiceDefinitionIdentifier, '%future added value'>
  | 'default';

const BADGE_COLORS: Record<RealServiceDefinitionIdentifier, string> = {
  vault: 'text-orange',
  link: 'text-turquoise',
  default: 'text-gray',
};

interface ServiceTypeBadgeProps {
  isPending?: boolean;
  type?: RealServiceDefinitionIdentifier;
  label: string;
}

export const ServiceTypeBadge: FunctionComponent<ServiceTypeBadgeProps> = ({
  isPending = false,
  type = 'default',
  label,
}) => {
  const badgeColor = isPending ? 'text-green' : BADGE_COLORS[type];
  return <Badge className={cn('uppercase', badgeColor)}>{label}</Badge>;
};
