import { db } from './db-connection';
export const removeSubscription = async (organizationId: string) => {
  await db('Subscription')
    .where('organization_id', '=', organizationId)
    .delete('*');
};
export const getSubscriptions = () => db('Subscription').select('*');
