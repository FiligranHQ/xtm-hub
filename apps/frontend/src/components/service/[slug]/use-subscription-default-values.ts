import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import { useMemo } from 'react';

interface SubscriptionDefaultValues {
  organization_id: string[];
  capability_ids: string[];
  start_date: Date;
  end_date: Date | undefined;
}

export const useSubscriptionDefaultValues = (
  subscriptionToEdit?: subscription_fragment$data
): SubscriptionDefaultValues => {
  return useMemo(
    () => ({
      organization_id: subscriptionToEdit?.organization.id
        ? [subscriptionToEdit.organization.id]
        : [],
      capability_ids:
        subscriptionToEdit?.subscription_capability
          ?.map((sc) => sc?.service_capability?.id)
          .filter((id): id is string => Boolean(id)) ?? [],
      start_date: subscriptionToEdit?.start_date
        ? new Date(subscriptionToEdit.start_date)
        : new Date(),
      end_date: subscriptionToEdit?.end_date
        ? new Date(subscriptionToEdit.end_date)
        : undefined,
    }),
    [subscriptionToEdit]
  );
};
