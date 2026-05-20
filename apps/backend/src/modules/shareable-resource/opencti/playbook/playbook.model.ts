import { DocumentMetadataKeyCode } from '../../../../__generated__/resolvers-types';
import Document from '../../../../model/kanel/public/Document';
import { MetadataArray } from '../../../../utils/metadata';

export const OPENCTI_PLAYBOOK_DOCUMENT_TYPE = 'opencti_playbook';

export type OpenCTIPlaybook = Document & {
  product_version: string;
};
export type OpenCTIPlaybookMetadataKeys = MetadataArray<
  keyof Omit<OpenCTIPlaybook, keyof Document>
>;

export const OPENCTI_PLAYBOOK_METADATA: OpenCTIPlaybookMetadataKeys = [
  { key: DocumentMetadataKeyCode.ProductVersion },
];

export const OPENCTI_PLAYBOOK_METADATA_KEYS = OPENCTI_PLAYBOOK_METADATA.map(
  ({ key }) => key
) as DocumentMetadataKeyCode[];
