import { toGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { contextAdminUser } from '../../../../tests/tests.const';
import { DocumentMutator } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import * as FileStorage from './document-storage';
import { insertDocument, sendFileToS3 } from './document.domain';
import {
  checkDocumentExists,
  createDocument,
  deleteDocumentBy,
  deleteDocuments,
  getDocumentName,
  loadUnsecureDocumentsBy,
  normalizeDocumentName,
} from './document.helper';
import documentResolver from './document.resolver';

describe('should call S3 to send file', () => {
  it('should call S3', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2023-01-01T00:00:00Z').getTime()
    );
    const mockInsertFileInMinio = vi
      .spyOn(FileStorage, 'insertFileInMinio')
      .mockResolvedValueOnce('mocked response');

    const fileMock = {
      mimetype: 'mimeType',
      filename: 'name',
      encoding: 'utf8',
      createReadStream: () => Readable.from(['file content']),
    };

    await sendFileToS3(
      fileMock,
      'name',
      'ba091095-418f-4b4f-b150-6c9295e232c3',
      'ba091095-418f-4b4f-b150-6c9295e232c3' as ServiceInstanceId
    );

    const expectedResult = {
      Bucket: 'xtmhubbucket',
      Key: getDocumentName(fileMock.filename),
      Body: fileMock.createReadStream(),
      Metadata: {
        mimetype: 'mimeType',
        filename: 'name',
        encoding: 'utf8',
        Uploadinguserid: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      },
    };
    expect(mockInsertFileInMinio).toHaveBeenCalledTimes(1);
    const callArguments = mockInsertFileInMinio.mock.calls[0][0];
    expect(callArguments.Bucket).toBe(expectedResult.Bucket);
    expect(callArguments.Metadata).toMatchObject(expectedResult.Metadata);
  });
});

describe('should add new file', () => {
  beforeAll(async () => {
    await createDocument({
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description',
      minio_name: 'minioName',
      file_name: 'filename',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    });
  });
  it('should create Document entry in DB', async () => {
    const data = {
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description2',
      minio_name: 'minioName2',
      file_name: 'filename2',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    };
    await insertDocument(data);
    const inDb = await loadUnsecureDocumentsBy({ file_name: 'filename2' });
    expect(inDb).toBeTruthy();
    expect(inDb[0].file_name).toEqual('filename2');
  });

  it('should pass old Documents into inactive state', async () => {
    const data = {
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description3',
      minio_name: 'minioName3',
      file_name: 'filename',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    };
    await insertDocument(data);
    const inDb = await loadUnsecureDocumentsBy({ file_name: 'filename' });
    expect(inDb).toBeTruthy();
    expect(inDb.length).toEqual(2);
    expect(inDb[0].active).toEqual(false);
    expect(inDb[1].active).toEqual(true);
  });

  afterAll(async () => {
    await deleteDocuments();
  });
});

describe('Should modify document', () => {
  beforeAll(async () => {
    await createDocument({
      id: 'bc348e84-3635-46de-9b56-38db09c35f4d',
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description',
      minio_name: 'minioName',
      file_name: 'filename',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    });
  });
  it('Should update document description', async () => {
    const response = await documentResolver.Mutation.editDocument(
      {},
      {
        documentId: toGlobalId(
          'Document',
          'bc348e84-3635-46de-9b56-38db09c35f4d'
        ),
        serviceInstanceId: toGlobalId(
          'ServiceInstance',
          'c6343882-f609-4a3f-abe0-a34f8cb11302'
        ),
        input: { description: 'NEW' },
      },
      contextAdminUser
    );
    expect(response.description).toStrictEqual('NEW');
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
    expect(result).toStrictEqual('naia-mee-mo-');
  });
});

describe('should check if file already exists', () => {
  beforeAll(async () => {
    await createDocument({
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description',
      minio_name: 'minioName',
      file_name: 'filename',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    });
  });

  it.each`
    expected | fileName      | title               | serviceInstanceId
    ${true}  | ${'filename'} | ${'Already exists'} | ${'c6343882-f609-4a3f-abe0-a34f8cb11302'}
    ${false} | ${'test'}     | ${'Does not exist'} | ${'c6343882-f609-4a3f-abe0-a34f8cb11302'}
    ${false} | ${'test'}     | ${'Does not exist'} | ${'c6343882-f609-4a3f-abe0-a34f8cb11301'}
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
    await createDocument({
      id: 'aefd2d32-adae-4329-b772-90a2fb8516ad',
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description',
      minio_name: 'minioName',
      file_name: 'filename',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    });
    await createDocument({
      id: '96847916-2f35-4402-8e64-888c5d5e8b7a',
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'xdescription',
      minio_name: 'xminioName',
      file_name: 'xfilename',
      service_instance_id:
        'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceInstanceId,
    });
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
          'c6343882-f609-4a3f-abe0-a34f8cb11302'
        ),
      },
      contextAdminUser as PortalContext
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
          'c6343882-f609-4a3f-abe0-a34f8cb11302'
        ),
      },
      contextAdminUser
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
          'c6343882-f609-4a3f-abe0-a34f8cb11302'
        ),
      },
      contextAdminUser
    );
    expect(response?.totalCount).toStrictEqual('1');
    expect(response?.edges[0].node.file_name).toStrictEqual('xfilename');
  });
  afterAll(async () => {
    await deleteDocuments();
  });
});
