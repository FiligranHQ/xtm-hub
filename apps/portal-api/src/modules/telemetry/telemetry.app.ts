import { OneClickDeployInput } from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { loadServiceDefinition } from '../services/service-instance.domain';
import { buildOneClickDeployEvent } from './telemetry.helper';
import { TelemetryEvent } from './telemetry.types';

const TELEMETRY_INDEX = 'telemetry';

export const telemetryApp = {
  async sendTelemetryEvent(event: TelemetryEvent) {
    try {
      await esDbClient.index({
        index: TELEMETRY_INDEX,
        document: event,
      });
    } catch (error) {
      logApp.error('Error sending telemetry event ', { event, error });
    }
  },

  async sendOneClickDeployEvent(
    context: PortalContext,
    { userId, input }: { userId: UserId; input: OneClickDeployInput }
  ) {
    const selected_organization_id = context.user.selected_organization_id;

    const selectedOrga = await loadOrganizationBy(
      context,
      'id',
      selected_organization_id
    );
    const serviceDefinition = await loadServiceDefinition(
      context,
      extractId<'ServiceInstance'>(input.service_instance_id)
    );

    const event = buildOneClickDeployEvent(
      selected_organization_id,
      selectedOrga.name,
      userId,
      serviceDefinition.identifier,
      input.target_product,
      extractId<'OpenCTIPlatform'>(input.platform_id),
      extractId<DocumentId>(input.resource_id),
      input.resource_title
    );
    telemetryApp.sendTelemetryEvent(event);
  },
};
