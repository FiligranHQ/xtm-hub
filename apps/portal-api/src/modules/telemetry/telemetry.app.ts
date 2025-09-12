import { OneClickDeployInput } from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { serviceContractDomain } from '../services/contract/domain';
import { loadServiceDefinitionByServiceInstance } from '../services/service-instance.domain';
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
    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      context,
      extractId<ServiceInstanceId>(input.service_instance_id)
    );

    const platform_id = extractId<'RegisteredPlatform'>(input.platform_id);
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platform_id
      );

    const config = serviceConfiguration.config as object;

    const event = buildOneClickDeployEvent(
      selected_organization_id,
      selectedOrga.name,
      userId,
      serviceDefinition.identifier,
      input.platform_identifier,
      platform_id,
      'platform_version' in config
        ? (config.platform_version as string)
        : undefined,
      extractId<DocumentId>(input.resource_id),
      input.resource_title
    );
    telemetryApp.sendTelemetryEvent(event);
  },
};
