import { Document as DocumentResolverType } from '../../../../../__generated__/resolvers-types';
import Document from '../../../../../model/kanel/public/Document';
import { MetadataArray } from '../../../../../utils/metadata';

export const OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE =
  'opencti_custom_dashboard';

export type CustomDashboard = Document & {
  product_version: string;
};
export type CustomDashboardMetadataKeys = MetadataArray<
  Exclude<keyof Omit<CustomDashboard, 'use_cases'>, keyof DocumentResolverType>
>;

export const CUSTOM_DASHBOARD_METADATA: CustomDashboardMetadataKeys = [
  { key: 'product_version' },
];

export const CUSTOM_DASHBOARD_METADATA_KEYS = CUSTOM_DASHBOARD_METADATA.map(
  ({ key }) => key
);
