import config from 'config';
import { OneClickDeployInput } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { DocumentId } from '../../model/kanel/public/Document';
import { UserId } from '../../model/kanel/public/User';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { PgBossProducer } from '../../thirdparty/pgboss/producer';
import { TELEMETRY_QUEUES } from '../../thirdparty/pgboss/telemetry.jobs';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organization-management/organizations/organizations.domain';
import {
  loadPlatformConfigurationByServiceInstanceId,
  loadServiceDefinitionByServiceInstance,
} from '../service/instance/service-instance.domain';
import { buildOneClickDeployEvent } from './telemetry.helper';
import { TelemetryEvent, TelemetryEventType } from './telemetry.types';

const TELEMETRY_INDEX = 'telemetry';

export async function indexTelemetryEvent(event: TelemetryEvent) {
  await esDbClient.index({
    index: TELEMETRY_INDEX,
    document: event,
  });
}

const useQueueProcessing = (): boolean =>
  config.get<boolean>('telemetry_use_queue_processing');

const getQueuedEventTypes = (): string[] =>
  config.get<string[]>('telemetry_queued_event_types');

export const telemetryApp = {
  async sendTelemetryEvent(event: TelemetryEvent) {
    try {
      if (useQueueProcessing()) {
        const queuedTypes = getQueuedEventTypes();
        if (
          queuedTypes.length === 0 ||
          queuedTypes.includes(event.event_type)
        ) {
          try {
            await PgBossProducer.send(TELEMETRY_QUEUES.EVENTS, { event });
          } catch (error) {
            logApp.error('Failed to enqueue telemetry event', { event, error });
          }
          return;
        }
      }
      indexTelemetryEvent(event).catch((error) => {
        logApp.error('Error sending telemetry event synchronously', {
          event,
          error,
        });
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
    const { user } = requestContext.require();
    const selected_organization_id = user.selected_organization_id;

    const selectedOrga = await loadOrganizationBy({
      id: selected_organization_id,
    });
    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      input.service_instance_id
    );

    const platformServiceInstanceId = extractId<'RegisteredPlatform'>(
      input.platform_service_instance_id
    );
    const serviceConfiguration =
      await loadPlatformConfigurationByServiceInstanceId(
        platformServiceInstanceId
      );

    const config = serviceConfiguration.config as object;

    const event = await buildOneClickDeployEvent(
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
    await telemetryApp.sendTelemetryEvent(event);
  },
};
