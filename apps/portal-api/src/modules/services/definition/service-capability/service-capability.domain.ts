import { db } from '../../../../../knexfile';
import ServiceCapability, {
  ServiceCapabilityMutator,
} from '../../../../model/kanel/public/ServiceCapability';
import { PortalContext } from '../../../../model/portal-context';
import { addPrefixToObject } from '../../../../utils/typescript';

export const loadServiceCapabilitiesBy = async (
  context: PortalContext,
  field:
    | addPrefixToObject<ServiceCapabilityMutator, 'Service_Capability.'>
    | ServiceCapabilityMutator
): Promise<ServiceCapability[]> => {
  const serviceCapabilities: ServiceCapability[] = await db<ServiceCapability>(
    context,
    'Service_Capability'
  )
    .where(field)
    .select('Service_Capability.*');
  return serviceCapabilities;
};
