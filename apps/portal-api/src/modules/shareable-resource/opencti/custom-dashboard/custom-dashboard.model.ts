import { DocumentMetadataKeyCode } from '../../../../__generated__/resolvers-types';
import Document from '../../../../model/kanel/public/Document';
import { MetadataArray } from '../../../../utils/metadata';

export const OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE =
  'opencti_custom_dashboard';

export type CustomDashboard = Document & {
  product_version: string;
};
export type CustomDashboardMetadataKeys = MetadataArray<
  keyof Omit<CustomDashboard, keyof Document>
>;

export const CUSTOM_DASHBOARD_METADATA: CustomDashboardMetadataKeys = [
  { key: DocumentMetadataKeyCode.ProductVersion },
];

export const CUSTOM_DASHBOARD_METADATA_KEYS = CUSTOM_DASHBOARD_METADATA.map(
  ({ key }) => key
) as DocumentMetadataKeyCode[];
