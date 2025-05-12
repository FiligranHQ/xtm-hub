import { toGlobalId } from 'graphql-relay/node/node.js';
import { dbUnsecure } from '../../../../knexfile';
import {
  CreateCustomDashboardInput,
  Document as DocumentResolverType,
  UpdateCustomDashboardInput,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { createDocument, updateDocument } from '../document/document.domain';
import { MinioFile } from '../document/document.helper';

export type CustomDashboard = Document & {
  product_version: string;
};
export type CustomDashboardMetadataKeys = Array<
  Exclude<keyof Omit<CustomDashboard, 'labels'>, keyof DocumentResolverType>
>;

export const CUSTOM_DASHBOARD_METADATA: CustomDashboardMetadataKeys = [
  'product_version',
];

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
    .select(['Document.id', 'Document.file_name'])
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
    CUSTOM_DASHBOARD_METADATA
  );
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

export const updateCustomDashboard = async (
  id: string,
  input: UpdateCustomDashboardInput,
  files: MinioFile[],
  context: PortalContext
) => {
  const data = {
    ...input,
    type: 'custom_dashboard',
  };

  if (files.length > 0) {
    Object.assign(data, {
      file_name: files[0].fileName,
      minio_name: files[0].minioName,
      mime_type: files[0].mimeType,
    });
  }

  /*const dashboardFile = files.shift();
  const dashboard = await createDocument<CustomDashboard>(
    context,
    {
      ...input,
      type: 'custom_dashboard',
      file_name: dashboardFile.fileName,
      minio_name: dashboardFile.minioName,
      mime_type: dashboardFile.mimeType,
    },
    CUSTOM_DASHBOARD_METADATA
  );
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
    */

  const dashboard = await updateDocument<CustomDashboard>(
    context,
    id,
    data,
    CUSTOM_DASHBOARD_METADATA
  );

  return dashboard;
};
