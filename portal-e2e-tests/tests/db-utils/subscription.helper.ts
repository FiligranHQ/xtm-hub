import { db } from './db-connection';
export const removeSubscription = async (organizationId) => {
  await db('Subscription')
    .delete('*')
    .where('organization_id', '=', organizationId);
};
