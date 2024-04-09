import { dbUnsecure } from '../../../knexfile';
import User from '../../model/kanel/public/User';

export const addNewUser = (data: User) => {
  return dbUnsecure<User>('User')
    .insert(data)
    .returning('*');
};
