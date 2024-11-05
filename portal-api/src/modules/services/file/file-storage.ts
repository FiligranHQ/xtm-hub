import { Upload as S3Upload } from '@aws-sdk/lib-storage';
import config from 'config';
import { Readable } from 'stream';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export interface UploadedFile {
  createReadStream: () => Readable;
  filename: string;
  mimetype: string;
  encoding: string;
}
export const isStorageAlive = () => initializeBucket();
export const initializeBucket = async () => {
  try {
    // Try to access to the bucket
    await s3Client.send(
      new HeadBucketCommand({ Bucket: config.get('minio.bucketName') })
    );
    return true;
  } catch (err) {
    // If bucket not exist, try to create it.
    // If creation fail, propagate the exception

    console.error(err);
    await s3Client.send(
      new CreateBucketCommand({ Bucket: config.get('minio.bucketName') })
    );
    return true;
  }
};
export const insertFileInMinio = async (fileParams) => {
  const fileKey = fileParams.Key;
  const s3Upload = new S3Upload({
    client: s3Client,
    params: fileParams,
  });
  await s3Upload.done();
  console.log('[MinIO] inserted file ', fileParams.Key);
  return await fileKey;
};

export const downloadFileFromMinio = async(minioName: string, fileName: string) => {
  const object = new GetObjectCommand({
    Bucket: config.get('minio.bucketName'),
    Key: minioName,
    client: s3Client,
    ResponseContentDisposition: `attachment; filename="${fileName}"`
  });
  const downloadUrl = await getSignedUrl(s3Client, object, { expiresIn: 3600 });

  return downloadUrl
}


