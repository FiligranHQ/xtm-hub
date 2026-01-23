import { Readable } from 'stream';

export interface UploadedFile {
  createReadStream: () => Readable;
  filename: string;
  mimetype: string;
  encoding: string;
}

export interface MinioFile {
  minioName: string;
  fileName: string;
  mimeType: string;
  jsonContent?: Record<string, unknown>;
}
