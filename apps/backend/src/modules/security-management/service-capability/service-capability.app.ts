import { UserServiceCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import UserServiceCapabilityModel from '../../../model/kanel/public/UserServiceCapability';
import { ServiceCapabilityDomain } from './service-capability.domain';

export const ServiceCapabilityApp = {
  loadServiceCapabilitiesByServiceId: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<UserServiceCapability[]> => {
    const user = requestContext.requireUser();

    const serviceCapabilities =
      await ServiceCapabilityDomain.loadServiceCapabilitiesByServiceId(
        serviceInstanceId,
        user.id
      );

    return serviceCapabilities.filter(
      (
        serviceCapability
      ): serviceCapability is UserServiceCapabilityModel & {
        user_service_id: string;
      } => serviceCapability.user_service_id !== null
    );
  },
};
