import { Client, ClientOptions } from '@elastic/elasticsearch';
import { v4 as uuidv4 } from 'uuid';
import portalConfig from '../../config';
import { logApp } from '../../utils/app-logger.util';
import {
  BaseTelemetryEvent,
  CreateEvent,
  DownloadEvent,
  EnrollEvent,
  LoginEvent,
  OneClickDeployEvent,
  ShareEvent,
  SubscribeEvent,
  TelemetryEvent,
} from './types';

export class ElasticPocService {
  private elasticsearchClient: Client;
  private indexName = 'telemetry-events';

  constructor() {
    const config: ClientOptions = {
      node: `${portalConfig.elasticsearch.protocol}://${portalConfig.elasticsearch.host}:${portalConfig.elasticsearch.port}`,
    };
    if (portalConfig.elasticsearch.username) {
      config.auth = {
        username: portalConfig.elasticsearch.username,
        password: portalConfig.elasticsearch.password,
      };
    }
    this.elasticsearchClient = new Client(config);
  }

  public generateBatchEvents(
    userId: string,
    organizationId: string,
    organizationName: string
  ): TelemetryEvent[] {
    const eventsPerType: number = 10;
    const events: TelemetryEvent[] = [];
    const eventTypes = [
      'login',
      'subscribe',
      'share',
      'download',
      'create',
      'enroll',
      'one_click_deploy',
    ];

    // Generate timestamps based on distribution type
    const now = new Date();
    const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const services = [
      'integration-feeds-library',
      'obas-scenarios-library',
      'custom-dashboard-library',
    ];
    const createStatuses = ['draft', 'published'];
    const downloadServices = [
      'integration-feeds-library',
      'octi-custom-dashboard',
    ];
    const products = ['open-cti', 'open-bas'];
    const orgTypes = ['professional', 'personal'];
    const resourceIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];

    for (const eventType of eventTypes) {
      for (let i = 0; i < eventsPerType; i++) {
        // Exponential growth: more events closer to now
        const expFactor = Math.exp((i / eventsPerType) * 3); // Scale factor
        const expProgress = (expFactor - 1) / (Math.exp(3) - 1);
        const timestamp = new Date(
          startTime.getTime() +
            expProgress * (now.getTime() - startTime.getTime())
        );

        const baseEvent: BaseTelemetryEvent = {
          event_type: eventType,
          organization_id: organizationId,
          organization_name: organizationName,
          user_id: userId,
          '@timestamp': timestamp.toISOString(),
          source: 'xtm-hub',
        };

        // Generate varied data for each event type
        switch (eventType) {
          case 'login':
            events.push(baseEvent as LoginEvent);
            break;

          case 'subscribe':
            events.push({
              ...baseEvent,
              subscribed_service: services[i % services.length],
            } as SubscribeEvent);
            break;

          case 'share':
            events.push({
              ...baseEvent,
              service: services[i % services.length],
              resource_id: resourceIds[i % resourceIds.length],
              resource_title: `Shared Resource ${i + 1}: ${services[i % services.length]}`,
            } as ShareEvent);
            break;

          case 'download':
            events.push({
              ...baseEvent,
              service: downloadServices[i % downloadServices.length],
              resource_id: resourceIds[i % resourceIds.length],
              resource_title: `Download ${i + 1}: ${downloadServices[i % downloadServices.length]}`,
            } as DownloadEvent);
            break;

          case 'create':
            events.push({
              ...baseEvent,
              service: services[i % services.length],
              resource_id: resourceIds[i % resourceIds.length],
              resource_title: `Created Resource ${i + 1}`,
              status: createStatuses[i % createStatuses.length],
            } as CreateEvent);
            break;

          case 'enroll':
            events.push({
              ...baseEvent,
              target_product: products[i % products.length],
              platform_id: `${products[i % products.length]}-${458 + i}`,
              organization_type: orgTypes[i % orgTypes.length],
            } as EnrollEvent);
            break;

          case 'one_click_deploy':
            events.push({
              ...baseEvent,
              target_product: products[i % products.length],
              service: services[i % services.length],
              resource_id: resourceIds[i % resourceIds.length],
              platform_id: uuidv4(),
            } as OneClickDeployEvent);
            break;
        }
      }
    }

    // Shuffle events to mix timestamps across event types
    return events.sort(() => Math.random() - 0.5);
  }

  public async bulkInsertEvents(events: TelemetryEvent[]): Promise<boolean> {
    // Prepare bulk operations
    const bulkOperations = [];
    for (const event of events) {
      bulkOperations.push({
        index: {
          _index: this.indexName,
          _id: uuidv4(),
        },
      });
      bulkOperations.push(event);
    }

    // Execute bulk operation
    const bulkResponse = await this.elasticsearchClient.bulk({
      body: bulkOperations,
    });

    if (bulkResponse.errors) {
      logApp.error('Bulk operation had errors', {
        errors: bulkResponse.items.filter((item) => item.index?.error),
      });
      return false;
    }

    logApp.info('Successfully inserted telemetry events', {
      count: events.length,
      indexName: this.indexName,
    });

    return true;
  }

  public async processBatchTelemetryEvents(
    userId: string,
    organizationId: string,
    organizationName: string
  ): Promise<boolean> {
    // Generate batch events
    const events = this.generateBatchEvents(
      userId,
      organizationId,
      organizationName
    );

    logApp.info('Generated batch telemetry events', {
      count: events.length,
      eventTypes: [...new Set(events.map((e) => e.event_type))],
      timeRange: {
        first: events[0]?.['@timestamp'],
        last: events[events.length - 1]?.['@timestamp'],
      },
    });

    // Bulk insert events
    const success = await this.bulkInsertEvents(events);

    if (success) {
      logApp.info('Batch telemetry POC completed successfully', {
        userId,
        organizationId,
        organizationName,
        totalEvents: events.length,
      });
    } else {
      logApp.error('Batch telemetry POC failed during bulk insertion');
    }

    return success;
  }
}

export default ElasticPocService;
