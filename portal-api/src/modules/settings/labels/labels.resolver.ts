import { Resolvers } from '../../../__generated__/resolvers-types';
import { LabelId } from '../../../model/kanel/public/Label';
import {
  addLabel,
  deleteLabelBy,
  editLabel,
  loadLabel,
  loadLabels,
} from './labels.domain';

const resolvers: Resolvers = {
  Query: {
    labels: (_, { first, after, orderMode, orderBy }, context) =>
      loadLabels(context, { first, after, orderMode, orderBy }),
    label: (_, { id }, context) => loadLabel(context, id),
  },
  Mutation: {
    addLabel: (_, { input }, context) => addLabel(context, input),
    editLabel: (_, { id, input }, context) => editLabel(context, { id, input }),
    deleteLabel: (_, { id }, context) =>
      deleteLabelBy(context, { id: id as LabelId }),
  },
};

export default resolvers;
