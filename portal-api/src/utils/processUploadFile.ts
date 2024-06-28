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

const processUpload = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const { path } = await storeUpload({ stream, filename });
  return { filename, mimetype, path };
};
export const processUploadFile = async (file) => {
  return await processUpload(file);
};
