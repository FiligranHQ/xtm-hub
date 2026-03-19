import { db } from './db-connection';

export const addEpic = async (epicData) => {
  await db('Epic').insert(epicData).onConflict('id').ignore();
};
