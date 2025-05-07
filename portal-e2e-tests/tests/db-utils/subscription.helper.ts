import { db } from './db-connection';
export const removeSubscription = async (organizationId: string) => {
  await db('Subscription')
    .where('organization_id', '=', organizationId)
    .delete('*');
};

export const removeSubscriptionFromService = async (
  organizationId: string,
  service_instance_id: string
) => {
  await db('Subscription')
    .where({
      organization_id: organizationId,
      service_instance_id: service_instance_id,
    })
    .delete('*');
};
export const getSubscriptions = () => db('Subscription').select('*');
