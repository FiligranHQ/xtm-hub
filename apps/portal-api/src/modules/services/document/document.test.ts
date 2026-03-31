import { toGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  contextBypassUser,
  requestContextAdminUser,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  IntegrationType,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetrySource,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { DocumentApp } from './document.app';
import {
  checkDocumentExists,
  deleteDocumentBy,
  deleteDocuments,
  getDocumentName,
  normalizeDocumentName,
} from './document.helper';
import documentResolver from './document.resolver';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from './opencti/custom-dashboards/custom-dashboards.model';
import {
  CsvFeed,
  INTEGRATION_CSV_FEED_METADATA_KEYS,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from './opencti/integrations/integrations.model';

describe('should call S3 to send file', () => {
  it('should call S3', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2023-01-01T00:00:00Z').getTime()
    );
    const mockInsertFileInMinio = vi
      .spyOn(MinIOClient, 'insertFile')
      .mockResolvedValueOnce('mocked response');

    const fileMock = {
      mimetype: 'mimeType',
      filename: 'name',
      encoding: 'utf8',
      createReadStream: () => Readable.from(['file content']),
    };

    await MinIOClient.sendFile(
      fileMock,
      'name',
      TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS
        .ID as unknown as ServiceInstanceId // unknown used because this id is an user id (#personalSpace)
    );

    const expectedResult = {
      Bucket: 'xtmhubbucket',
      Key: getDocumentName(fileMock.filename),
      Body: fileMock.createReadStream(),
      Metadata: {
        mimetype: 'mimeType',
        filename: 'name',
        encoding: 'utf8',
        Uploadinguserid: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      },
    };
    expect(mockInsertFileInMinio).toHaveBeenCalledTimes(1);
    const callArguments = mockInsertFileInMinio.mock.calls[0][0];
    expect(callArguments.Bucket).toBe(expectedResult.Bucket);
    expect(callArguments.Metadata).toMatchObject(expectedResult.Metadata);
  });
});

describe('Should modify document', () => {
  beforeAll(async () => {
    await DocumentApp.createDocumentWithChildrenAndMetadata(
      {
        id: 'bc348e84-3635-46de-9b56-38db09c35f4d' as DocumentId,
        uploader_id: toGlobalId(
          'User',
          TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
        ),
        description: 'description',
        minio_name: 'minioName',
        file_name: 'filename',
        uploader_organization_id:
          'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId,
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        type: ServiceDefinitionIdentifier.OpenctiCustomDashboards,
      },
      []
    );
  });

  it('Should delete document', async () => {
    await deleteDocumentBy({
      id: 'bc348e84-3635-46de-9b56-38db09c35f4d',
    } as DocumentMutator);
    const result = await checkDocumentExists(
      'filename',
      'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId
    );
    expect(result).toBe(false);
  });
  afterAll(async () => {
    await deleteDocuments();
  });
});

describe('getFileName', () => {
  it('should set the correct fileName', () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2023-01-01T00:00:00Z').getTime()
    );
    const result = getDocumentName('test.pdf');
    expect(result).toEqual('test_1672531200000.pdf');
  });
});

describe('should normalize filename', () => {
  it('should send a normalized fileName', () => {
    const result = normalizeDocumentName('Naîà-méE&mo!');
    expect(result).toStrictEqual('naia-mee-mo');
  });
});

describe('should check if file already exists', () => {
  beforeAll(async () => {
    await DocumentApp.createDocumentWithChildrenAndMetadata(
      {
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        description: 'description',
        minio_name: 'minioName',
        file_name: 'filename',
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        type: 'opencti_custom_dashboard',
      },
      []
    );
  });

  it.each`
    expected | fileName      | title               | serviceInstanceId
    ${true}  | ${'filename'} | ${'Already exists'} | ${SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID}
    ${false} | ${'test'}     | ${'Does not exist'} | ${SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID}
    ${false} | ${'test'}     | ${'Does not exist'} | ${SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID}
  `(
    'Should return $expected if filename $title',
    async ({ expected, fileName, serviceInstanceId }) => {
      const result = await checkDocumentExists(fileName, serviceInstanceId);
      expect(result).toEqual(expected);
    }
  );

  afterAll(async () => {
    await deleteDocuments();
  });
});

describe('Documents loading', () => {
  beforeAll(async () => {
    await DocumentApp.createDocumentWithChildrenAndMetadata(
      {
        id: 'aefd2d32-adae-4329-b772-90a2fb8516ad' as DocumentId,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        description: 'description',
        minio_name: 'minioName',
        file_name: 'filename',
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        type: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
      },
      []
    );
    await DocumentApp.createDocumentWithChildrenAndMetadata(
      {
        id: '96847916-2f35-4402-8e64-888c5d5e8b7a' as DocumentId,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        description: 'xdescription',
        minio_name: 'xminioName',
        file_name: 'xfilename',
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        type: OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
      },
      []
    );
  });

  it('should load all documents', async () => {
    const response = await documentResolver.Query.documents(
      {},
      {
        first: 50,
        searchTerm: '',
        orderBy: 'file_name',
        orderMode: 'asc',
        serviceInstanceId: toGlobalId(
          'ServiceInstance',
          SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID
        ),
      },
      contextBypassUser as PortalContext
    );
    expect(response?.totalCount).toStrictEqual('2');
    expect(response?.edges[0].node.file_name).toStrictEqual('filename');
    expect(response?.edges[1].node.file_name).toStrictEqual('xfilename');
  });

  it('should load all documents by desc order', async () => {
    const response = await documentResolver.Query.documents(
      {},
      {
        count: 50,
        searchTerm: '',
        orderBy: 'file_name',
        orderMode: 'desc',
        serviceInstanceId: toGlobalId(
          'ServiceInstance',
          SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID
        ),
      },
      contextBypassUser
    );
    expect(response?.totalCount).toStrictEqual('2');
    expect(response?.edges[0].node.file_name).toStrictEqual('xfilename');
    expect(response?.edges[1].node.file_name).toStrictEqual('filename');
  });

  it('should filter documents', async () => {
    const response = await documentResolver.Query.documents(
      {},
      {
        first: 50,
        after: 0,
        searchTerm: 'xfi',
        orderBy: 'file_name',
        orderMode: 'asc',
        serviceInstanceId: toGlobalId(
          'ServiceInstance',
          SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID
        ),
      },
      contextBypassUser
    );
    expect(response?.totalCount).toStrictEqual('1');
    expect(response?.edges[0].node.file_name).toStrictEqual('xfilename');
  });
});

describe('increment shared counter', () => {
  const documentId = '117804d0-2e0e-42f0-b87c-019de622f605';
  beforeAll(async () => {
    const testContext = {
      user: requestContextAdminUser.user,
      portalContext: {
        ...contextBypassUser,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
      },
    };
    requestContext.set(testContext);
    await DocumentApp.createDocumentWithChildrenAndMetadata<CsvFeed>(
      {
        id: documentId as DocumentId,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        name: 'Csv Feed',
        description: 'xdescription',
        minio_name: 'xminioName',
        file_name: 'csvfilename',
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        integration_type: IntegrationType.CsvFeed,
      },
      INTEGRATION_CSV_FEED_METADATA_KEYS
    );
    vi.spyOn(telemetryApp, 'countEventsByDocumentId').mockImplementation(
      async (eventType: TelemetryEventType, documentId: string) => {
        if (
          documentId === documentId &&
          eventType === TelemetryEventType.DOWNLOAD
        )
          return 5;
        if (documentId === documentId && eventType === TelemetryEventType.SHARE)
          return 12;
        return 0; // default
      }
    );
  });

  it('should send a share telemetry event for a logged user', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();

    await documentResolver.Mutation.incrementShareNumberDocument(
      {},
      {
        documentId: toGlobalId('DocumentId', documentId),
      },
      contextBypassUser
    );
    expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
      '@timestamp': '2025-02-03T13:12:15.000Z',
      event_type: TelemetryEventType.SHARE,
      organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      organization_name: 'Filigran',
      organization_type: 'Professional',
      source: TelemetrySource.XTMHUB,
      user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      service: TelemetryEventService.INTEGRATIONS_LIBRARY,
      service_type: TelemetryEventServiceType.CSV_FEEDS,
      resource_id: documentId,
      resource_title: 'Csv Feed',
    });
  });

  it('should send a share telemetry event for an anonymous user', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();

    await documentResolver.Mutation.incrementShareNumberDocument(
      {},
      {
        documentId: toGlobalId('DocumentId', documentId),
      },
      {}
    );
    expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
      '@timestamp': '2025-02-03T13:12:15.000Z',
      event_type: TelemetryEventType.SHARE,
      organization_type: 'Public',
      source: TelemetrySource.XTMHUB,
      service: TelemetryEventService.INTEGRATIONS_LIBRARY,
      service_type: TelemetryEventServiceType.CSV_FEEDS,
      resource_id: documentId,
      resource_title: 'Csv Feed',
    });
  });

  afterAll(async () => {
    await deleteDocuments();
    vi.useRealTimers();
  });
});
