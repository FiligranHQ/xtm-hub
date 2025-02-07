import { cn } from '@/lib/utils';
import { ServiceDefinitionIdentifier } from '@generated/serviceList_fragment.graphql';
import { Badge } from 'filigran-ui';
import { FunctionComponent } from 'react';

type ServiceDefinitionIdentifierWithDefault =
  | ServiceDefinitionIdentifier
  | 'default';

const BADGE_COLORS: Record<ServiceDefinitionIdentifierWithDefault, string> = {
  vault: 'text-orange',
  link: 'text-primary',
  custom_dashboards: 'text-blue',
  default: 'text-gray',
};

interface ServiceTypeBadgeProps {
  isPending?: boolean;
  type?: ServiceDefinitionIdentifierWithDefault;
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
