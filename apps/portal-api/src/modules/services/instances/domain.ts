import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import {
  PlatformIdentifier,
  ServiceInstanceCreationStatus,
  ServiceInstanceJoinType,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import {
  serviceInstanceNameMappedByPlatformIdentifier,
  serviceInstanceTagMappedByPlatformIdentifier,
} from '../../registration/registration.mapping';

export const serviceInstanceDomain = {
  createPlatformServiceInstance: async (
    serviceDefinitionId: string,
    platformIdentifier: PlatformIdentifier,
    creation_status: ServiceInstanceCreationStatus = ServiceInstanceCreationStatus.Ready
  ): Promise<ServiceInstanceId> => {
    const id = uuidv4() as ServiceInstanceId;
    await db('ServiceInstance').insert([
      {
        id,
        name: serviceInstanceNameMappedByPlatformIdentifier[platformIdentifier],
        description: '',
        creation_status,
        public: false,
        join_type: ServiceInstanceJoinType.JoinAuto,
        tags: [
          serviceInstanceTagMappedByPlatformIdentifier[platformIdentifier],
        ],
        service_definition_id: serviceDefinitionId,
      },
    ]);

    return id;
  },
};
