import * as s3 from '@aws-sdk/client-s3';
import { Upload as S3Upload } from '@aws-sdk/lib-storage';
import config from 'config';
import {Readable} from "stream";


const getEndpoint = () => {
    // If using AWS S3, unset the endpoint to let the library choose the best endpoint
    if (config.get('minio.endpoint') === 's3.amazonaws.com') {
        return undefined;
    }
    return `${(config.get('minio.useSsl') ? 'https' : 'http')}://${config.get('minio.endpoint')}:${config.get('minio.port')}`;
};

const s3Client = new s3.S3Client({
    region: config.get('minio.region'),
    endpoint: getEndpoint(),
    forcePathStyle: true,
    credentials: {
        accessKeyId: config.get('minio.accessKeyId'),
        secretAccessKey: config.get('minio.secretAccessKey'),
    },
    tls: config.get('minio.useSsl')
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
        await s3Client.send(new s3.HeadBucketCommand({ Bucket: config.get('minio.bucketName') }));
        return true;
    } catch (err) {
        // If bucket not exist, try to create it.
        // If creation fail, propagate the exception
        await s3Client.send(new s3.CreateBucketCommand({ Bucket: config.get('minio.bucketName') }));
        return true;
    }
};
export const insertFileInMinio = async (fileParams) => {
    const s3Upload = new S3Upload({
        client: s3Client,
        params: fileParams
    });
    await s3Upload.done();
    console.log("inserted file ", fileParams.Key + ' into Minio...')

    return await s3Upload.params.Key
}