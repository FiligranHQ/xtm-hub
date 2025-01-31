import { db, dbUnsecure } from '../../../../../knexfile';
import GenericServiceCapability, {
  GenericServiceCapabilityMutator,
} from '../../../../model/kanel/public/GenericServiceCapability';
import UserServiceCapability, {
  UserServiceCapabilityMutator,
} from '../../../../model/kanel/public/UserServiceCapability';
import { PortalContext } from '../../../../model/portal-context';

export const loadUnsecureServiceCapabilitiesBy = async (
  field: GenericServiceCapabilityMutator
) => {
  return dbUnsecure<GenericServiceCapability>('Generic_Service_Capability')
    .where(field)
    .leftJoin(
      'UserService_Capability',
      'Generic_Service_Capability.id',
      'UserService_Capability.generic_service_capability_id'
    );
};

export const loadUnsecureServiceCapabilitiesByUserService = async (
  field: UserServiceCapabilityMutator
) => {
  return dbUnsecure<GenericServiceCapability>('Generic_Service_Capability')
    .leftJoin(
      'UserService_Capability',
      'Generic_Service_Capability.id',
      'UserService_Capability.generic_service_capability_id'
    )
    .where(field);
};

export const insertServiceCapability = async (
  context: PortalContext,
  genericServiceCapabilityData
) => {
  return db<UserServiceCapability>(context, 'UserService_Capability')
    .insert(genericServiceCapabilityData)
    .returning('*');
};
