import { PortalContext } from '../../model/portal-context';
import { v4 as uuidv4 } from 'uuid';
import ServiceCapability, {
  ServiceCapabilityId,
} from '../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { db } from '../../../knexfile';

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
  console.log('capa inserted');
  return addedServiceCapa;
};
