import UserService, {
  UserServiceMutator,
} from '../../model/kanel/public/UserService';
import { dbUnsecure } from '../../../knexfile';

export const loadUnsecureUserServiceBy = (field: UserServiceMutator) => {
  return dbUnsecure<UserService>('User_Service').where(field);
};
