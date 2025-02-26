import { db } from './db-connection';
export const removeSubscription = async (organizationId: string) => {
  const subscriptionsList = await db('Subscription')
    .where('organization_id', '=', organizationId)
    .select('*');
  for (const sub of subscriptionsList) {
    await db('Subscription_Capability')
      .delete('*')
      .where('subscription_id', '=', sub.id);
  }
  await db('Subscription')
    .where('organization_id', '=', organizationId)
    .delete('*');
};
export const getSubscriptions = () => db('Subscription').select('*');
