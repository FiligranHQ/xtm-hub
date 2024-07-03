import { createWriteStream } from 'fs';
import { join } from 'path';

const storeUpload = async ({
  stream,
  filename,
}): Promise<{ path: string | Buffer }> => {
  const uploadDir = './uploads';
  const path = join(uploadDir, filename);
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ path }))
      .on('error', reject)
  );
};

export const processUploadFile = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const { path } = await storeUpload({ stream, filename });
  return { filename, mimetype, path };
};

export const processStreamFile = async (upload) => {
  const { createReadStream } = await upload;
  return createReadStream();
};

export const streamToBlob = (stream, mimeType) => {
  if (mimeType != null && typeof mimeType !== 'string') {
    throw new Error('Invalid mimetype, expected string.');
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream
      .on('data', (chunk) => chunks.push(chunk))
      .once('end', () => {
        const blob =
          mimeType != null
            ? new Blob(chunks, { type: mimeType })
            : new Blob(chunks);
        resolve(blob);
      })
      .once('error', reject);
  });
};
