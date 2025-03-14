import { db, dbRaw } from '../../../../knexfile';
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
    .where('Document.active', '=', true);
  return dashboards;
};

export const loadImagesByCustomDashboardId = async (
  context: PortalContext,
  customDashboardId: string
) => {
  const images = await db<Document>(context, 'Document')
    .select('Document.id')
    .where('parent_document_id', '=', customDashboardId)
    .where('Document.active', '=', true);
  return images;
};
