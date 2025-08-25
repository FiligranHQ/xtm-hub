import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';

export const OPENAEV_SCENARIO_DOCUMENT_TYPE = 'openaev_scenario';

export type OpenAEVScenario = Document & {
  product_version: string;
};
export type OpenAEVScenarioMetadataKeys = Array<
  Exclude<keyof Omit<OpenAEVScenario, 'labels'>, keyof DocumentResolverType>
>;

export const OPENAEV_SCENARIO_METADATA: OpenAEVScenarioMetadataKeys = [
  'product_version',
];
