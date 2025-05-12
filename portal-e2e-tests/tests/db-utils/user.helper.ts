import { db } from './db-connection';

export const getUser = async (email: string) => {
  const [user] = await db('User').select('*').where('email', '=', email);
  return user;
};

export const updateUser = async (id: string, user: any) => {
  await db('User').where('id', id).update(user);
};

export const removeUser = async (email: string) => {
  await db('User').delete('*').where('email', '=', email);
};
