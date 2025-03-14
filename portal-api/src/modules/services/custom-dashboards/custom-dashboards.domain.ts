import { db, dbRaw, dbUnsecure } from '../../../../knexfile';
import Document from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';

export const loadSeoCustomDashboardsByServiceSlug = async (
  context: PortalContext,
  serviceSlug: string
) => {
  const dashboards = await db<Document>(context, 'Document')
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
    .where('Document.mime_type', 'like', 'image/%')
    .where('Document.active', '=', true);
  return images;
};

export const loadSeoCustomDashboardBySlug = async (
  context: PortalContext,
  slug: string
) => {
  const dashboard = await db<Document>(context, 'Document')
    .select('Document.*')
    .where('Document.slug', '=', slug)
    .where('Document.active', '=', true)
    .first();
  return dashboard;
};
