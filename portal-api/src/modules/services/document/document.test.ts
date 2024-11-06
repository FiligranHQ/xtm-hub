import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ServiceId } from '../../../model/kanel/public/Service';
import {
  checkFileExists,
  createDocument,
  deleteDocuments,
  getFileName,
  loadUnsecureDocumentsBy,
  normalizeFileName,
} from './document.helper';
import { insertDocument, sendFileToS3 } from './document.domain';
import { Readable } from 'stream';
import * as FileStorage from './document-storage';
import fileResolver from "./document.resolver";
import {contextAdminUser} from "../../../../tests/tests.const";

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

    await sendFileToS3(fileMock, 'ba091095-418f-4b4f-b150-6c9295e232c3');

    const expectedResult = {
      Bucket: 'xtmhubbucket',
      Key: getFileName(fileMock.filename),
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
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
    });
  });
  it('should create Document entry in DB', async () => {
    const data = {
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description2',
      minio_name: 'minioName2',
      file_name: 'filename2',
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
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
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
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

describe("Should update file", () => {
  beforeAll(async () => {
    await createDocument({
      id: 'bc348e84-3635-46de-9b56-38db09c35f4d',
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description',
      minio_name: 'minioName',
      file_name: 'filename',
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
    });
  });
  it("Should update file description", async () => {
    const response = await fileResolver.Mutation.editFile(
        {}, {documentId: 'bc348e84-3635-46de-9b56-38db09c35f4d', newDescription: 'NEW'}, contextAdminUser
    );
    expect(response.description).toStrictEqual('NEW')
  })
  afterAll(async () => {
    await deleteDocuments();
  });
})

describe('getFileName', () => {
  it('should set the correct fileName', () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2023-01-01T00:00:00Z').getTime()
    );
    const result = getFileName('test.pdf');
    expect(result).toEqual('test_1672531200000.pdf');
  });
});

describe('should normalize filename', () => {
  it('should send a normalized fileName', () => {
    const result = normalizeFileName('Naîà-méE&mo!');
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
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
    });
  });

  it.each`
    expected | fileName      | title
    ${true}  | ${'filename'} | ${'Already exists'}
    ${false} | ${'test'}     | ${'Does not exist'}
  `(
    'Should return $expected if filename $title',
    async ({ expected, fileName }) => {
      const result = await checkFileExists(fileName);
      expect(result).toEqual(expected);
    }
  );

  afterAll(async () => {
    await deleteDocuments();
  });
});


describe("Documents loading", () => {
  beforeAll(async () => {
    await createDocument({
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'description',
      minio_name: 'minioName',
      file_name: 'filename',
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
    });
    await createDocument({
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      description: 'xdescription',
      minio_name: 'xminioName',
      file_name: 'xfilename',
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302' as ServiceId,
    });
  });

  it("should load all documents", async () => {
    const response = await fileResolver.Query.documents(
        {}, {first: 1, after: 0, filter: "xfi", orderBy: 'file_name', orderMode: 'asc'}, contextAdminUser
    );
    expect(response?.totalCount).toStrictEqual('2')
    expect(response?.edges[0].node.file_name).toStrictEqual('xfilename')
  })
  afterAll(async () => {
    await deleteDocuments();
  });
})