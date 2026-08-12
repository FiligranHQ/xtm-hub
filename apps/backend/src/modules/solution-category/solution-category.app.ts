import {
  EditSolutionCategoryInput,
  FiligranProduct,
} from '../../__generated__/resolvers-types';
import { ObjectSolutionCategoryObjectId } from '../../model/kanel/public/ObjectSolutionCategory';
import SolutionCategory, {
  SolutionCategoryId,
  SolutionCategoryMutator,
} from '../../model/kanel/public/SolutionCategory';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { stripNulls } from '../../utils/typescript';
import { objectSolutionCategoryDomain } from './object-solution-category/object-solution-category.domain';
import { solutionCategoryDomain } from './solution-category.domain';
import {
  buildSolutionCategoryIndex,
  resolveSolutionCategoryNames,
} from './solution-category.utils';

export const solutionCategoryApp = {
  deleteSolutionCategoryBy: async (
    field: SolutionCategoryMutator
  ): Promise<SolutionCategory> => {
    const solutionCategory =
      await solutionCategoryDomain.loadSolutionCategoryBy(field);
    if (!solutionCategory) {
      throw new Error(ErrorCode.SolutionCategoryNotFound);
    }

    await objectSolutionCategoryDomain.deleteObjectSolutionCategoryBy({
      solution_category_id: solutionCategory.id,
    });

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

  linkSolutionCategoriesByNameToObject: async ({
    objectId,
    names,
    product,
  }: {
    objectId: ObjectSolutionCategoryObjectId;
    names: readonly string[];
    product: FiligranProduct;
  }): Promise<void> => {
    if (names.length === 0) {
      return;
    }

    const categories = await solutionCategoryDomain.loadAllSolutionCategories();
    const index = buildSolutionCategoryIndex(categories, product);
    const { resolved, unknown } = resolveSolutionCategoryNames(names, index);

    if (unknown.length > 0) {
      logApp.warn('[MANIFEST] Unknown solution categories ignored', {
        objectId,
        product,
        count: unknown.length,
        sample: unknown.slice(0, 10),
      });
    }

    if (resolved.length === 0) {
      return;
    }

    await objectSolutionCategoryDomain.insertObjectSolutionCategory(
      resolved.map((solutionCategoryId) => ({
        object_id: objectId,
        solution_category_id: solutionCategoryId,
      }))
    );
  },
};
