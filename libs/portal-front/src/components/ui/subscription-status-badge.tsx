import { cn } from '@/lib/utils';
import { Badge } from 'filigran-ui';
import { FunctionComponent } from 'react';

export type SubscriptionStatusTypeBadge = 'ACCEPTED' | 'REQUESTED' | 'REFUSED';

interface SubscriptionStatusBadgeProps {
  type?: SubscriptionStatusTypeBadge;
}

export const SubscriptionStatusBadge: FunctionComponent<
  SubscriptionStatusBadgeProps
> = ({ type }) => {
  const badgeColor = {
    REFUSED: 'text-red',
    REQUESTED: 'text-orange',
    ACCEPTED: 'text-green',
  };
  return (
    <>
      {type && (
        <Badge className={cn('uppercase', badgeColor[type])}>{type}</Badge>
      )}
    </>
  );
};
