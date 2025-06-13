import { toGlobalId } from 'graphql-relay/node/node.js';
import { dbUnsecure } from '../../../../knexfile';
import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';

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
    .where('Document.type', '=', 'custom_dashboard')
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
