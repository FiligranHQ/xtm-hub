import { cn } from '@/lib/utils';
import { Badge } from 'filigran-ui';
import { FunctionComponent } from 'react';
import { ServiceDefinitionIdentifier } from '../../../__generated__/serviceList_fragment.graphql';

const BADGE_COLORS: Record<ServiceDefinitionIdentifier, string> = {
  vault: 'text-orange',
  link: 'text-darkblue',
} as Record<ServiceDefinitionIdentifier, string>;

interface ServiceTypeBadgeProps {
  isPending?: boolean;
  type?: ServiceDefinitionIdentifier;
  label: string;
}

export const ServiceTypeBadge: FunctionComponent<ServiceTypeBadgeProps> = ({
  isPending = false,
  type,
  label,
}) => {
  const badgeColor = isPending
    ? 'text-green'
    : type
      ? BADGE_COLORS[type]
      : 'text-gray';
  return <Badge className={cn('uppercase', badgeColor)}>{label}</Badge>;
};
