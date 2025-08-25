import { Document as DocumentResolverType } from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';

export const OPENAEV_SCENARIO_DOCUMENT_TYPE = 'openaev_scenario';

export type ObasScenario = Document & {
  product_version: string;
};
export type ObasScenarioMetadataKeys = Array<
  Exclude<keyof Omit<ObasScenario, 'labels'>, keyof DocumentResolverType>
>;

export const OBAS_SCENARIO_METADATA: ObasScenarioMetadataKeys = [
  'product_version',
];
