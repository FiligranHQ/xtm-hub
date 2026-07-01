import config from 'config';
import { OneClickDeployInput } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { UserId } from '../../model/kanel/public/User';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { PgBossProducer } from '../../thirdparty/pgboss/producer';
import { TELEMETRY_QUEUES } from '../../thirdparty/pgboss/telemetry.jobs';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { extractId } from '../../utils/utils';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import { ServiceInstanceDomain } from '../service/instance/service-instance.domain';
import { TelemetryHelper } from './telemetry.helper';
import { TelemetryEvent, TelemetryEventType } from './telemetry.types';

const TELEMETRY_INDEX = 'telemetry';

const useQueueProcessing = (): boolean =>
  config.get<boolean>('telemetry_use_queue_processing');

const getQueuedEventTypes = (): string[] =>
  config.get<string[]>('telemetry_queued_event_types');

export const TelemetryApp = {
  async indexTelemetryEvent(event: TelemetryEvent) {
    await esDbClient.index({
      index: TELEMETRY_INDEX,
      document: event,
    });
  },

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
      TelemetryApp.indexTelemetryEvent(event).catch((error) => {
        logApp.error('Error sending telemetry event synchronously', {
          event,
          error,
        });
      });
    } catch (error) {
      logApp.error('Error sending telemetry event ', { event, error });
    }
  },

  async getMostDeployedResourceIds(limit: number): Promise<string[]> {
    const result = await esDbClient.search({
      index: TELEMETRY_INDEX,
      size: 0,
      query: {
        term: { event_type: TelemetryEventType.ONE_CLICK_DEPLOY },
      },
      aggs: {
        resource_counts: {
          terms: {
            field: 'resource_id',
            size: limit,
            order: { _count: 'desc' },
          },
        },
      },
    });

    const agg = result.aggregations?.resource_counts as
      { buckets: Array<{ key: string; doc_count: number }> } | undefined;

    return agg?.buckets.map((bucket) => bucket.key) ?? [];
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
    const user = requestContext.requireUser();
    const selected_organization_id = user.selected_organization_id;

    const selectedOrga = await OrganizationDomain.loadOrganizationBy({
      id: selected_organization_id,
    });
    if (!selectedOrga) {
      throw new Error(ErrorCode.OrganizationNotFound);
    }

    const serviceDefinition =
      await ServiceInstanceDomain.loadServiceDefinitionByServiceInstance(
        input.service_instance_id
      );

    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceNotFound);
    }
    const platformServiceInstanceId = extractId<'RegisteredPlatform'>(
      input.platform_service_instance_id
    );
    const platformConfiguration =
      await ServiceInstanceDomain.loadPlatformConfigurationByServiceInstanceId(
        platformServiceInstanceId
      );
    if (!platformConfiguration) {
      throw new Error(ErrorCode.PlatformConfigurationNotFound);
    }

    const event = await TelemetryHelper.buildOneClickDeployEvent(
      selectedOrga,
      userId,
      serviceDefinition.identifier,
      input.platform_identifier,
      platformConfiguration?.platform_id,
      platformConfiguration?.platform_version ?? undefined,
      input.resource_id,
      input.resource_title,
      platformConfiguration?.tenant_id ?? undefined
    );
    await TelemetryApp.sendTelemetryEvent(event);
  },
};
