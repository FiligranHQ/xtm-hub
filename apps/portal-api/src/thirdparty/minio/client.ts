import * as s3 from '@aws-sdk/client-s3';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload as S3Upload } from '@aws-sdk/lib-storage';
import config from 'config';
import Stream from 'node:stream';
import { requestContext } from '../../context/request.context';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  getDocumentName,
  normalizeDocumentName,
} from '../../modules/services/document/document.helper';
import { Upload } from '../../modules/services/document/document.uploads.helper';
import { logApp } from '../../utils/app-logger.util';
import { MinioFile, UploadedFile } from './types';

const getEndpoint = () => {
  // If using AWS S3, unset the endpoint to let the library choose the best endpoint
  if (config.get('minio.endpoint') === 's3.amazonaws.com') {
    return undefined;
  }
  return `${config.get('minio.useSsl') === 'true' ? 'https' : 'http'}://${config.get('minio.endpoint')}:${config.get('minio.port')}`;
};

const s3Client = new S3Client({
  region: config.get('minio.region'),
  endpoint: getEndpoint(),
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.get('minio.accessKeyId'),
    secretAccessKey: config.get('minio.secretAccessKey'),
  },
  tls: config.get('minio.useSsl') === 'true' ? true : false,
});

export const MinIOClient = {
  initializeBucket: async (): Promise<boolean> => {
    try {
      // Try to access to the bucket
      await s3Client.send(
        new HeadBucketCommand({ Bucket: config.get('minio.bucketName') })
      );
      return true;
    } catch (err) {
      // If bucket not exist, try to create it.
      // If creation fail, propagate the exception

      logApp.error(err);
      await s3Client.send(
        new CreateBucketCommand({ Bucket: config.get('minio.bucketName') })
      );
      return true;
    }
  },

  createFile: async (
    jsonFile: Upload,
    serviceInstanceId: ServiceInstanceId
  ): Promise<MinioFile> => {
    const { user } = requestContext.require();
    const fileName = normalizeDocumentName(jsonFile.file.filename);
    const { minioName, jsonContent } = await MinIOClient.sendFile(
      jsonFile.file,
      fileName,
      user.id,
      serviceInstanceId
    );

    return {
      minioName,
      fileName,
      mimeType: jsonFile.file.mimetype,
      jsonContent,
    };
  },

  insertFile: async (fileParams) => {
    const fileKey: string = fileParams.Key;
    const s3Upload = new S3Upload({
      client: s3Client,
      params: fileParams,
    });
    await s3Upload.done();
    logApp.debug('[MinIO] inserted file ', fileParams.Key);
    return fileKey;
  },

  sendFile: async (
    file: UploadedFile,
    filename: string,
    userId: string,
    serviceInstanceId: ServiceInstanceId
  ): Promise<{ minioName: string; jsonContent?: Record<string, unknown> }> => {
    const fullMetadata = {
      mimetype: file.mimetype,
      filename,
      encoding: file.encoding,
      Uploadinguserid: userId,
      ServiceInstanceId: serviceInstanceId,
    };

    const stream = file.createReadStream();
    const fileParams = {
      Bucket: config.get('minio.bucketName'),
      Key: getDocumentName(file.filename),
      Body: stream,
      Metadata: fullMetadata,
    };

    const jsonContent =
      file.mimetype === 'application/json'
        ? await parseJsonStream(stream)
        : undefined;

    const minioName = await MinIOClient.insertFile(fileParams);
    return {
      minioName,
      jsonContent,
    };
  },

  downloadFile: async (minioName: string) => {
    try {
      const object = await s3Client.send(
        new s3.GetObjectCommand({
          Bucket: config.get('minio.bucketName'),
          Key: minioName,
        })
      );
      return object.Body;
    } catch (err) {
      logApp.error('[FILE STORAGE] Cannot retrieve file from S3', {
        error: err,
      });
      return null;
    }
  },

  deleteFile: async (minioName: string) => {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: config.get('minio.bucketName'),
      Key: minioName,
    });
    await s3Client.send(deleteCommand);
  },
};

const parseJsonStream = async (
  stream: Stream.Readable
): Promise<Record<string, unknown> | undefined> => {
  const content = await new Response(stream).text();
  try {
    return JSON.parse(content);
  } catch (err) {
    logApp.error(`unable to parse JSON stream: ${err.message}`);
    return undefined;
  }
};
