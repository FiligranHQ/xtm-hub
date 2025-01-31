import { dbUnsecure } from '../../../../knexfile';
import { GenericServiceCapability } from '../../../__generated__/resolvers-types';
import { GenericServiceCapabilityMutator } from '../../../model/kanel/public/GenericServiceCapability';

export const loadGenericServiceCapabilityBy = async (
  field: GenericServiceCapabilityMutator
) => {
  return dbUnsecure<GenericServiceCapability>(
    'Generic_Service_Capability'
  ).where(field);
};
