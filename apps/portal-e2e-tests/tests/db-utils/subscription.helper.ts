import { db } from './db-connection';

export const removeSubscriptionFromService = async (subscription: {
  organizationId: string;
  serviceInstanceId: string;
}) => {
  await db('Subscription')
    .where({
      organization_id: subscription.organizationId,
      service_instance_id: subscription.serviceInstanceId,
    })
    .delete('*');
};
export const getSubscriptions = () => db('Subscription').select('*');

export const addSubscription = async (subscriptionData) => {
  await db('Subscription').insert(subscriptionData).onConflict('id').ignore();
};
