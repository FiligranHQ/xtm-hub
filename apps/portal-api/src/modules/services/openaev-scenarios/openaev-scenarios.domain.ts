import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import { MetadataArray } from '../../../utils/metadata';

export const OPENAEV_SCENARIO_DOCUMENT_TYPE = 'openaev_scenario';

export type OpenAEVScenario = Document & {
  product_version: string;
};
export type OpenAEVScenarioMetadataKeys = MetadataArray<
  Exclude<keyof Omit<OpenAEVScenario, 'labels'>, keyof DocumentResolverType>
>;

export const OPENAEV_SCENARIO_METADATA: OpenAEVScenarioMetadataKeys = [
  { key: 'product_version' },
];

export const OPENAEV_SCENARIO_METADATA_KEYS = OPENAEV_SCENARIO_METADATA.map(
  ({ key }) => key
);
