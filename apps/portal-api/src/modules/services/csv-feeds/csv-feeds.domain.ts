import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';

export const CSV_FEED_DOCUMENT_TYPE = 'csv_feed';

export type CsvFeed = Document;

export type CsvFeedMetadataKeys = Array<
  Exclude<keyof Omit<CsvFeed, 'labels'>, keyof DocumentResolverType>
>;

export const CSV_FEED_METADATA: CsvFeedMetadataKeys = [];
