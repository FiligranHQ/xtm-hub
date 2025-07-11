import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';

export const CUSTOM_DASHBOARD_DOCUMENT_TYPE = 'custom_dashboard';

export type CustomDashboard = Document & {
  product_version: string;
};
export type CustomDashboardMetadataKeys = Array<
  Exclude<keyof Omit<CustomDashboard, 'labels'>, keyof DocumentResolverType>
>;

export const CUSTOM_DASHBOARD_METADATA: CustomDashboardMetadataKeys = [
  'product_version',
];
