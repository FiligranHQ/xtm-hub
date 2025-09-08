import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import {
  serviceInstanceNameMappedByPlatformIdentifier,
  serviceInstanceTagMappedByPlatformIdentifier,
} from '../registration/registration.mapping';

export const serviceInstanceDomain = {
  createPlatformServiceInstance: async (
    context: PortalContext,
    serviceDefinitionId: string,
    platformIdentifier: PlatformIdentifier
  ): Promise<ServiceInstanceId> => {
    const id = uuidv4() as ServiceInstanceId;
    await db(context, 'ServiceInstance').insert([
      {
        id,
        name: serviceInstanceNameMappedByPlatformIdentifier[platformIdentifier],
        description: '',
        creation_status: 'READY',
        public: false,
        join_type: 'JOIN_AUTO',
        tags: [
          serviceInstanceTagMappedByPlatformIdentifier[platformIdentifier],
        ],
        service_definition_id: serviceDefinitionId,
      },
    ]);

    return id;
  },
};
