import { Knex } from 'knex';
import { dbUnsecure } from '../../../../knexfile';
import UserTransferRequest, {
  UserTransferRequestInitializer,
  UserTransferRequestMutator,
} from '../../../model/kanel/public/UserTransferRequest';
import { addPrefixToObject } from '../../../utils/typescript';

export const insertNewUserTransfer = (
  data: UserTransferRequestInitializer,
  trx?: Knex.Transaction
) => {
  return dbUnsecure<UserTransferRequest>('User_TransferRequest')
    .insert(data)
    .returning('*')
    .modify((qb) => {
      if (trx) qb.transacting(trx);
    })
    .returning('*');
};

export const loadUserTransfer = (
  field:
    | addPrefixToObject<UserTransferRequestMutator, 'User_TransferRequest.'>
    | UserTransferRequestMutator
) => {
  return dbUnsecure<UserTransferRequest>('User_TransferRequest')
    .where(field)
    .first();
};
