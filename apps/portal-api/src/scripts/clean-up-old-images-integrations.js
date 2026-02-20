import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from 'config';
import Knex from 'knex';

const knex = Knex({
  client: 'pg',
  connection: {
    host: config.get('database.host'),
    port: config.get('database.port'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database:
      process.env.VITEST_MODE || process.env.NODE_ENV === 'test'
        ? config.get('database-test.database')
        : config.get('database.database'),
  },
  pool: { min: 0, max: 5 },
});

const s3Client = new S3Client({
  region: config.get('minio.region'),
  endpoint:
    config.get('minio.endpoint') === 's3.amazonaws.com'
      ? undefined
      : `${config.get('minio.useSsl') === 'true' ? 'https' : 'http'}://${config.get('minio.endpoint')}:${config.get('minio.port')}`,
  credentials: {
    accessKeyId: config.get('minio.accessKeyId'),
    secretAccessKey: config.get('minio.secretAccessKey'),
  },
  forcePathStyle: true,
});

async function run() {
  const documents = await knex('Document')
    .leftJoin(
      'ServiceInstance',
      'ServiceInstance.id',
      'Document.service_instance_id'
    )
    .whereIn('ServiceInstance.slug', [
      'opencti-integrations',
      'openaev-scenarios',
    ])
    .select('Document.id', 'Document.minio_name');
  // eslint-disable-next-line no-console
  console.log(`${documents.length} documents trouvés`);

  for (const doc of documents) {
    if (!doc.minio_name) {
      continue;
    }
    const childrenDocuments = await knex('Document_Children')
      .where('parent_document_id', '=', doc.id)
      .leftJoin(
        'Document',
        'Document.id',
        '=',
        'Document_Children.child_document_id'
      )
      .select([
        'Document_Children.child_document_id',
        'Document.minio_name',
        'Document.id',
      ]);
    // eslint-disable-next-line no-console
    console.log('children found for parent document: ', doc.id);
    for (const child of childrenDocuments) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: config.get('minio.bucketName'),
          Key: child.minio_name,
        })
      );

      // eslint-disable-next-line no-console
      console.log(`Delete child ${child.child_document_id}`);
      await knex('Document').where({ id: child.child_document_id }).delete();
    }
  }

  await knex.destroy();
  // eslint-disable-next-line no-console
  console.log('✅ Cleanup over');
}

run().catch(async (err) => {
  console.error('❌ Cleanup failed', err);
  await knex.destroy();
  process.exit(1);
});
