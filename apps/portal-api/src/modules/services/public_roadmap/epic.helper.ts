import {
  EpicType,
  FiligranProduct,
  Epic as GraphqlEpic,
  Timeline,
} from '../../../__generated__/resolvers-types';
import Epic from '../../../model/kanel/public/Epic';
export const mapToGraphqlEpic = (epic: Epic): GraphqlEpic => {
  return {
    ...epic,
    product: epic.product as FiligranProduct,
    timeline: epic.timeline as Timeline,
    epic_type: epic.epic_type as EpicType,
  };
};
