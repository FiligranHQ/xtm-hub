import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';

export const serviceInstanceDomain = {
  createPlatformServiceInstance: async (
    context: PortalContext,
    serviceDefinitionId: string,
    identifier: PlatformIdentifier
  ): Promise<ServiceInstanceId> => {
    const nameMapping: Record<PlatformIdentifier, string> = {
      [PlatformIdentifier.Opencti]: 'OpenCTI Platform',
    };
    const tagMapping: Record<PlatformIdentifier, string> = {
      [PlatformIdentifier.Opencti]: 'openCTI',
    };

    const id = uuidv4() as ServiceInstanceId;
    await db(context, 'ServiceInstance').insert([
      {
        id,
        name: nameMapping[identifier],
        description: '',
        creation_status: 'READY',
        public: false,
        join_type: 'JOIN_AUTO',
        tags: [tagMapping[identifier]],
        service_definition_id: serviceDefinitionId,
      },
    ]);

    return id;
  },
};
