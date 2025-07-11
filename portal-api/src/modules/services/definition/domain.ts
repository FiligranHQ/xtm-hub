import { db } from '../../../../knexfile';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
import { PortalContext } from '../../../model/portal-context';

export const serviceDefinitionDomain = {
  loadServiceDefinitionBy(
    context: PortalContext,
    field: ServiceDefinitionMutator
  ): Promise<ServiceDefinition> {
    return db(context, 'ServiceDefinition').where(field).select('id').first();
  },
};
