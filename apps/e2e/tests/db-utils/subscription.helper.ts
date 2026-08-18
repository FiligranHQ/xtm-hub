import { db } from './db-connection';

export const addSubscription = async (subscriptionData) => {
  await db('Subscription').insert(subscriptionData).onConflict('id').ignore();
};
