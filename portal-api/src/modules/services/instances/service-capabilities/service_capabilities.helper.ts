import { db, dbUnsecure } from '../../../../../knexfile';
import GenericServiceCapability, {
  GenericServiceCapabilityMutator,
} from '../../../../model/kanel/public/GenericServiceCapability';
import { PortalContext } from '../../../../model/portal-context';

export const loadUnsecureServiceCapabilitiesBy = async (
  field: GenericServiceCapabilityMutator
) => {
  return dbUnsecure<GenericServiceCapability>(
    'Generic_Service_Capability'
  ).where(field);
};

export const insertServiceCapability = async (
  context: PortalContext,
  genericServiceCapabilityData
) => {
  return db<GenericServiceCapability>(context, 'Generic_Service_Capability')
    .insert(genericServiceCapabilityData)
    .returning('*');
};
