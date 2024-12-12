import { db } from './db-connection';
export const removeSubscription = async (organizationId) => {
  return db('Subscription')
    .delete('*')
    .where('organization_id', '=', organizationId);
};

export const getSubscriptions = async () => {
  return db('Subscription').select('*');
};
