import { Resolvers } from '../../__generated__/resolvers-types';
import {
  SolutionCategoryId,
  SolutionCategoryMutator,
} from '../../model/kanel/public/SolutionCategory';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { solutionCategoryApp } from './solution-category.app';
import { solutionCategoryDomain } from './solution-category.domain';

const resolvers: Resolvers = {
  SolutionCategoryId:
    createRelayIdScalar<SolutionCategoryId>('SolutionCategory'),

  Query: {
    solutionCategories: (_, opts) =>
      solutionCategoryDomain.loadSolutionCategories(opts),
  },
  Mutation: {
    addSolutionCategory: (_, { input }) =>
      solutionCategoryDomain.insertSolutionCategory({
        ...input,
        product: input.product ?? [],
      }),
    editSolutionCategory: (_, { id, input }) =>
      solutionCategoryApp.editSolutionCategoryById(
        id as SolutionCategoryId,
        input
      ),
    deleteSolutionCategory: (_, { id }) =>
      solutionCategoryApp.deleteSolutionCategoryBy({
        id,
      } as SolutionCategoryMutator),
  },
};

export default resolvers;
