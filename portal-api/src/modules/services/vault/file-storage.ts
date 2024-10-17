import * as s3 from '@aws-sdk/client-s3';
import { Upload as S3Upload } from '@aws-sdk/lib-storage';
import config from 'config';
import {Readable} from "stream";

const s3Client = new s3.S3Client({
    region: config.get('minio.region'),
    endpoint: config.get('minio.endpoint'),
    forcePathStyle: true,
    credentials: {
        accessKeyId: config.get('minio.accessKeyId'),
        secretAccessKey: config.get('minio.secretAccessKey'),
    },
    tls: false
});

export interface UploadedFile {
        createReadStream: () => Readable;
        filename: string;
        mimetype: string;
        encoding: string;
}

export const insertFileInMinio = async (fileParams) => {
    const s3Upload = new S3Upload({
        client: s3Client,
        params: fileParams
    });
    await s3Upload.done();
    console.log("inserted file ", fileParams.Key + ' into Minio...')

    return await s3Upload.params.Key
}