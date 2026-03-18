import {
  DocumentImageType,
  Document as DocumentResolverType,
} from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import { MetadataArray } from '../../../utils/metadata';

export type DocumentImage = Document & {
  image_type: DocumentImageType;
};

export type DocumentImageMetadata = MetadataArray<
  Exclude<keyof Omit<DocumentImage, 'use_cases'>, keyof DocumentResolverType>
>;

export const DOCUMENT_IMAGE_METADATA: DocumentImageMetadata = [
  { key: 'image_type' },
];

export const DOCUMENT_IMAGE_METADATA_KEYS = DOCUMENT_IMAGE_METADATA.map(
  ({ key }) => key
);
