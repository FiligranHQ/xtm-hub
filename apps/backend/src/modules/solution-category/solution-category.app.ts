import { EditSolutionCategoryInput } from '../../__generated__/resolvers-types';
import SolutionCategory, {
  SolutionCategoryId,
  SolutionCategoryMutator,
} from '../../model/kanel/public/SolutionCategory';
import { ErrorCode } from '../../utils/error/error.code';
import { stripNulls } from '../../utils/typescript';
import { solutionCategoryDomain } from './solution-category.domain';

export const solutionCategoryApp = {
  deleteSolutionCategoryBy: async (
    field: SolutionCategoryMutator
  ): Promise<SolutionCategory> => {
    const solutionCategory =
      await solutionCategoryDomain.loadSolutionCategoryBy(field);
    if (!solutionCategory) {
      throw new Error(ErrorCode.SolutionCategoryNotFound);
    }

    const deletedSolutionCategory =
      await solutionCategoryDomain.deleteSolutionCategory(field);
    if (!deletedSolutionCategory) {
      throw new Error(ErrorCode.SolutionCategoryNotFound);
    }

    return deletedSolutionCategory;
  },

  editSolutionCategoryById: async (
    id: SolutionCategoryId,
    input: EditSolutionCategoryInput
  ): Promise<SolutionCategory> => {
    const updated = await solutionCategoryDomain.updateSolutionCategory(
      id,
      stripNulls(input)
    );
    if (!updated) {
      throw new Error(ErrorCode.SolutionCategoryNotFound);
    }
    return updated;
  },
};
