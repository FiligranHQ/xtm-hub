import * as s3 from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import config from 'config';

const getEndpoint = () => {
  // If using AWS S3, unset the endpoint to let the library choose the best endpoint
  if (config.get('minio.endpoint') === 's3.amazonaws.com') {
    return undefined;
  }
  return `${config.get('minio.useSsl') === 'true' ? 'https' : 'http'}://${config.get('minio.endpoint')}:${config.get('minio.port')}`;
};

const downloadFile = async (minio_name) => {
  const s3Client = new S3Client({
    region: config.get('minio.region'),
    endpoint: getEndpoint(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.get('minio.accessKeyId'),
      secretAccessKey: config.get('minio.secretAccessKey'),
    },
    tls: config.get('minio.useSsl') === 'true',
  });

  const object = await s3Client.send(
    new s3.GetObjectCommand({
      Bucket: config.get('minio.bucketName'),
      Key: minio_name,
    })
  );
  return object.Body;
};

const updateDocument = async (knex, document) => {
  const minio_name = document.minio_name;
  try {
    const stream = await downloadFile(minio_name);
    const content = await stream.transformToString();
    const parsed = JSON.parse(content);
    if (!parsed || !parsed.configuration || !parsed.configuration.uri) {
      console.warn(
        `Skipping feed_url metadata insert: missing configuration.uri for document ${document.id} (minio_name: ${minio_name}).`
      );
      return;
    }

    const feedUrl = parsed.configuration.uri;
    await knex('Document_Metadata').insert({
      document_id: document.id,
      key: 'feed_url',
      value: feedUrl,
    });
  } catch (err) {
    console.error(
      `Failed to update feed_url metadata for document ${document.id} (minio_name: ${minio_name}):`,
      err
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const documents = await knex('Document')
    .leftJoin(
      'Document_Metadata',
      'Document.id',
      '=',
      'Document_Metadata.document_id'
    )
    .where('Document_Metadata.key', '=', 'integration_type')
    .whereIn('Document_Metadata.value', ['csv_feed', 'taxii_feed', 'stream'])
    .select('Document.*')
    .groupBy('Document.id');

  await Promise.all(
    documents.map(async (document) => updateDocument(knex, document))
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('Document_Metadata')
    .where('Document_Metadata.key', '=', 'feed_url')
    .del();
}
