import { Resolvers } from '../../../__generated__/resolvers-types';
import { LabelId, LabelMutator } from '../../../model/kanel/public/Label';
import { labelsApp } from './labels.app';
import { labelsDomain } from './labels.domain';

const resolvers: Resolvers = {
  Query: {
    labels: (_, opts) => labelsDomain.loadLabels(opts),
    label: (_, { id }) => labelsDomain.loadLabelBy({ id } as LabelMutator),
  },
  Mutation: {
    addLabel: (_, { input }) => labelsDomain.insertLabel(input),
    editLabel: (_, { id, input }) =>
      labelsDomain.updateLabel(id as LabelId, input),
    deleteLabel: (_, { id }) => labelsApp.deleteLabelBy({ id } as LabelMutator),
  },
};

export default resolvers;
