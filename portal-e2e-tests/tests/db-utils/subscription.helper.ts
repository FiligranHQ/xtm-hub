import { db } from './db-connection';
export const removeSubscription = async (organizationId: string) =>
  db('Subscription').delete('*').where('organization_id', '=', organizationId);

export const getSubscriptions = () => db('Subscription').select('*');
