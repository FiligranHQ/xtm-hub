import { db } from '../../../../../knexfile';
import UserTransferRequest, {
  UserTransferRequestInitializer,
  UserTransferRequestMutator,
} from '../../../../model/kanel/public/UserTransferRequest';
import { addPrefixToObject } from '../../../../utils/typescript';

export const UserTransferRequestDomain = {
  insertNewUserTransfer: (
    data: UserTransferRequestInitializer
  ): Promise<UserTransferRequest[]> => {
    return db<UserTransferRequest>('User_TransferRequest')
      .insert(data)
      .returning('*');
  },

  loadUserTransfer: (
    field:
      | addPrefixToObject<UserTransferRequestMutator, 'User_TransferRequest.'>
      | UserTransferRequestMutator
  ) => {
    return db<UserTransferRequest>('User_TransferRequest').where(field).first();
  },

  deleteUserTransferRequest: async (field: UserTransferRequestMutator) => {
    return db<UserTransferRequest>('User_TransferRequest')
      .where(field)
      .delete('*')
      .returning('*');
  },
};
