import { db, paginate } from '../../../knexfile';
import {
  QuerySolutionCategoriesArgs,
  SolutionCategoryConnection,
} from '../../__generated__/resolvers-types';
import SolutionCategory, {
  SolutionCategoryId,
  SolutionCategoryInitializer,
  SolutionCategoryMutator,
} from '../../model/kanel/public/SolutionCategory';
import { UnknownErrorCode } from '../../utils/error/error.code';

export const solutionCategoryDomain = {
  insertSolutionCategory: async (
    input: SolutionCategoryInitializer
  ): Promise<SolutionCategory> => {
    const [solutionCategory] = await db<SolutionCategory>('SolutionCategory')
      .insert(input)
      .returning('*');
    if (!solutionCategory) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return solutionCategory;
  },

  updateSolutionCategory: async (
    id: SolutionCategoryId,
    fields: SolutionCategoryMutator
  ): Promise<SolutionCategory | undefined> => {
    const [solutionCategory] = await db<SolutionCategory>('SolutionCategory')
      .where({ id })
      .update(fields)
      .returning('*');
    return solutionCategory;
  },

  loadSolutionCategories: (
    opts: Partial<QuerySolutionCategoriesArgs>
  ): Promise<SolutionCategoryConnection> => {
    const solutionCategoryQuery = db<SolutionCategory>(
      'SolutionCategory'
    ).modify((queryBuilder) => {
      if (opts.product) {
        queryBuilder.andWhereRaw(
          '"SolutionCategory"."product"::text[] @> ARRAY[?]::text[]',
          [opts.product]
        );
      }
    });

    return paginate<SolutionCategory, SolutionCategoryConnection>(
      'SolutionCategory',
      opts,
      undefined,
      solutionCategoryQuery
    );
  },

  loadSolutionCategoryBy: (
    field: SolutionCategoryMutator
  ): Promise<SolutionCategory | null> => {
    return db<SolutionCategory>('SolutionCategory').where(field).first();
  },

  loadSolutionCategoryByLikeName: (
    name: string
  ): Promise<SolutionCategory | undefined> => {
    return db<SolutionCategory>('SolutionCategory')
      .where('name', 'ILIKE', name)
      .select('*')
      .first();
  },

  deleteSolutionCategory: async (
    field: SolutionCategoryMutator
  ): Promise<SolutionCategory | undefined> => {
    const [deletedSolutionCategory] = await db<SolutionCategory>(
      'SolutionCategory'
    )
      .where(field)
      .delete('*');

    return deletedSolutionCategory;
  },
};
