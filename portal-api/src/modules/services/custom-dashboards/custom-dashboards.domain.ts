import { toGlobalId } from 'graphql-relay/node/node.js';
import { dbRaw, dbUnsecure } from '../../../../knexfile';
import Document from '../../../model/kanel/public/Document';

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
    .where(dbRaw('"Document"."parent_document_id" IS NULL'))
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
    .where('parent_document_id', '=', customDashboardId)
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
    .first();
  return dashboard;
};
