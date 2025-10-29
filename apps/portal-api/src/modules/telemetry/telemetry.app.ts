import { OneClickDeployInput } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { DocumentId } from '../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { UserId } from '../../model/kanel/public/User';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import {
  loadPlatformConfigurationByServiceInstanceId,
  loadServiceDefinitionByServiceInstance,
} from '../services/service-instance.domain';
import { buildOneClickDeployEvent } from './telemetry.helper';
import { TelemetryEvent, TelemetryEventType } from './telemetry.types';

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

  async countEventsByDocumentId(
    eventType: TelemetryEventType,
    documentId: string
  ) {
    return await esDbClient.count({
      index: TELEMETRY_INDEX,
      query: {
        bool: {
          filter: [
            { term: { event_type: eventType } },
            { term: { resource_id: documentId } },
          ],
        },
      },
    });
  },

  async sendOneClickDeployEvent({
    userId,
    input,
  }: {
    userId: UserId;
    input: OneClickDeployInput;
  }) {
    const { user, portalContext } = requestContext.require();
    const selected_organization_id = user.selected_organization_id;

    const selectedOrga = await loadOrganizationBy({
      id: selected_organization_id,
    });
    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      portalContext,
      extractId<ServiceInstanceId>(input.service_instance_id)
    );

    const platformServiceInstanceId = extractId<'RegisteredPlatform'>(
      input.platform_service_instance_id
    );
    const serviceConfiguration =
      await loadPlatformConfigurationByServiceInstanceId(
        portalContext,
        platformServiceInstanceId
      );

    const config = serviceConfiguration.config as object;

    const event = buildOneClickDeployEvent(
      selectedOrga,
      userId,
      serviceDefinition.identifier,
      input.platform_identifier,
      'platform_id' in config ? (config.platform_id as string) : undefined,
      'platform_version' in config
        ? (config.platform_version as string)
        : undefined,
      extractId<DocumentId>(input.resource_id),
      input.resource_title
    );
    telemetryApp.sendTelemetryEvent(event);
  },
};
