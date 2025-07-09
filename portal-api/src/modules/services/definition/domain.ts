import { db } from '../../../../knexfile';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { PortalContext } from '../../../model/portal-context';

export const serviceDefinitionDomain = {
  findByIdentifier(
    context: PortalContext,
    identifier: string
  ): Promise<ServiceDefinition> {
    return db(context, 'ServiceDefinition')
      .where('identifier', '=', identifier)
      .select('id')
      .first();
  },
};
