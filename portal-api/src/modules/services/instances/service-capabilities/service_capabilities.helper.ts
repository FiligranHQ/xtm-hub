import { db, dbUnsecure } from '../../../../../knexfile';
import ServiceCapability, {
  ServiceCapabilityMutator,
} from '../../../../model/kanel/public/ServiceCapability';
import { PortalContext } from '../../../../model/portal-context';

export const loadUnsecureServiceCapabilitiesBy = async (
  field: ServiceCapabilityMutator
) => {
  return dbUnsecure<ServiceCapability>('Service_Capability').where(field);
};

export const insertServiceCapability = async (
  context: PortalContext,
  serviceCapabilityData
) => {
  return db<ServiceCapability>(context, 'Service_Capability')
    .insert(serviceCapabilityData)
    .returning('*');
};
