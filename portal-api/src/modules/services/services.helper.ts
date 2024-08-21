import Service, { ServiceMutator } from '../../model/kanel/public/Service';
import { dbUnsecure } from '../../../knexfile';

export const deleteServiceUnsecure = async (field: ServiceMutator) => {
  return dbUnsecure<Service>('Service').where(field).delete('*');
};
