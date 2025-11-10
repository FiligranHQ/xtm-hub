import { db } from '../../../../../knexfile';
import ServiceCapability, {
  ServiceCapabilityMutator,
} from '../../../../model/kanel/public/ServiceCapability';
import { addPrefixToObject } from '../../../../utils/typescript';

export const loadServiceCapabilitiesBy = async (
  field:
    | addPrefixToObject<ServiceCapabilityMutator, 'Service_Capability.'>
    | ServiceCapabilityMutator
): Promise<ServiceCapability[]> => {
  return db<ServiceCapability>('Service_Capability')
    .where(field)
    .select('Service_Capability.*');
};
