import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';

interface SubscriptionDefaultValues {
  organization_id: string[];
  capability_ids: string[];
  start_date: Date;
  end_date: Date | undefined;
}

/**
 * Computes the default form values for the subscription form.
 * When editing, pre-fills the form with the existing subscription data.
 * When creating, starts with an empty form and today's date.
 */
export const getSubscriptionDefaultValues = (
  subscriptionToEdit?: subscription_fragment$data
): SubscriptionDefaultValues => {
  return {
    organization_id: subscriptionToEdit?.organization.id
      ? [subscriptionToEdit.organization.id]
      : [],
    capability_ids:
      subscriptionToEdit?.subscription_capability
        ?.map((sc) => sc?.service_capability?.id)
        .filter((id): id is string => Boolean(id)) ?? [],
    start_date: new Date(subscriptionToEdit?.start_date ?? Date.now()),
    end_date: subscriptionToEdit?.end_date
      ? new Date(subscriptionToEdit.end_date)
      : undefined,
  };
};
