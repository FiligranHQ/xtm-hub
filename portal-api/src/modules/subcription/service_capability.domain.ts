import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import ServiceCapability, {
  ServiceCapabilityId,
} from '../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';

export const insertCapa = async (
  context: PortalContext,
  userServiceId: string,
  serviceCapabilityName: string
) => {
  const serviceCapaData = {
    id: uuidv4() as ServiceCapabilityId,
    user_service_id: userServiceId as UserServiceId,
    service_capability_name: serviceCapabilityName,
  };
  const [addedServiceCapa] = await db<ServiceCapability>(
    context,
    'Service_Capability'
  )
    .insert(serviceCapaData)
    .returning('*');
  return addedServiceCapa;
};
