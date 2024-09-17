import {
  SubscriptionStatusBadge,
  SubscriptionStatusTypeBadge,
} from '@/components/ui/subscription-status-badge';
import { FunctionComponent } from 'react';

interface ServiceHeaderProps {
  serviceType?: string | null;
  serviceName?: string;
  subscriptionStatus?: SubscriptionStatusTypeBadge;
}

export const ServiceHeader: FunctionComponent<ServiceHeaderProps> = ({
  serviceType,
  serviceName,
  subscriptionStatus,
}) => (
  <div className="flex items-center gap-s pb-l">
    <h2>
      <span className="capitalize">{serviceType?.toLowerCase()}</span> -{' '}
      {serviceName}
    </h2>
    {subscriptionStatus && (
      <SubscriptionStatusBadge type={subscriptionStatus} />
    )}
  </div>
);
