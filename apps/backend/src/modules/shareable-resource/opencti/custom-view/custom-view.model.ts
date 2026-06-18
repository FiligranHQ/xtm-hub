import { DocumentMetadataKeyCode } from '../../../../__generated__/resolvers-types';
import Document from '../../../../model/kanel/public/Document';
import { MetadataArray } from '../../../../utils/metadata';

export const OPENCTI_CUSTOM_VIEW_DOCUMENT_TYPE = 'opencti_custom_view';

export type CustomView = Document & {
  product_version: string;
};
export type CustomViewMetadataKeys = MetadataArray<
  keyof Omit<CustomView, keyof Document>
>;

export const CUSTOM_VIEW_METADATA: CustomViewMetadataKeys = [
  { key: DocumentMetadataKeyCode.ProductVersion },
];

export const CUSTOM_VIEW_METADATA_KEYS: DocumentMetadataKeyCode[] = [
  ...(CUSTOM_VIEW_METADATA.map(({ key }) => key) as DocumentMetadataKeyCode[]),
  DocumentMetadataKeyCode.EntityTypes,
];
