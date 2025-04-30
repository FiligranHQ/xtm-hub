import { toGlobalId } from 'graphql-relay/node/node.js';
import { dbUnsecure } from '../../../../knexfile';
import {
  CreateCustomDashboardInput,
  CustomDashboard,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { createDocument, MinioFile } from '../document/document.helper';

export const loadSeoCustomDashboardsByServiceSlug = async (
  serviceSlug: string
) => {
  const dashboards = await dbUnsecure<Document>('Document')
    .select('Document.*')
    .leftJoin(
      'ServiceInstance',
      'Document.service_instance_id',
      'ServiceInstance.id'
    )
    .whereNotExists(function () {
      this.select('*')
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .where('ServiceInstance.slug', '=', serviceSlug)
    .where('Document.active', '=', true)
    .orderBy([
      { column: 'Document.updated_at', order: 'desc' },
      { column: 'Document.created_at', order: 'desc' },
    ]);
  return dashboards;
};

export const loadImagesByCustomDashboardId = async (
  customDashboardId: string
) => {
  const images = await dbUnsecure<Document>('Document')
    .select('Document.id')
    .join(
      'Document_Children',
      'Document.id',
      '=',
      'Document_Children.child_document_id'
    )
    .where('Document_Children.parent_document_id', '=', customDashboardId)
    .where('Document.mime_type', 'like', 'image/%');

  for (const image of images) {
    image.id = toGlobalId('Document', image.id);
  }
  return images;
};

export const loadSeoCustomDashboardBySlug = async (slug: string) => {
  const dashboard = await dbUnsecure<Document>('Document')
    .select('Document.*')
    .where('Document.slug', '=', slug)
    .where('Document.active', '=', true)
    .whereNotExists(function () {
      this.select('*')
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .first();
  return dashboard;
};

export const createCustomDashboard = async (
  input: CreateCustomDashboardInput,
  files: MinioFile[],
  context: PortalContext
) => {
  const dashboardFile = files.shift();
  const dashboard = await createDocument<CustomDashboard>(
    context,
    {
      ...input,
      type: 'custom_dashboard',
      file_name: dashboardFile.fileName,
      minio_name: dashboardFile.minioName,
      mime_type: dashboardFile.mimeType,
    },
    ['product_version']
  );
  console.log('Dashboard created:', dashboard);
  if (files.length > 0) {
    await Promise.all(
      files.map((file) => {
        createDocument(context, {
          type: 'image',
          parent_document_id: dashboard.id as DocumentId,
          file_name: file.fileName,
          minio_name: file.minioName,
          mime_type: file.mimeType,
        });
      })
    );
  }
  return dashboard;
};
