import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import { PortalContext } from '../../../model/portal-context';

export const serviceInstanceDomain = {
  createOCTIServiceInstance: async (
    context: PortalContext,
    serviceDefinitionId: string
  ): Promise<string> => {
    const id = uuidv4();
    await db(context, 'ServiceInstance').insert([
      {
        id,
        name: 'OpenCTI Instance',
        description: '',
        creation_status: 'READY',
        public: false,
        join_type: 'JOIN_AUTO',
        tags: ['openCTI'],
        service_definition_id: serviceDefinitionId,
      },
    ]);

    return id;
  },
};
