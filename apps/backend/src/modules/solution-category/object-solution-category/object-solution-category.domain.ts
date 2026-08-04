import { db } from '../../../../knexfile';
import ObjectSolutionCategory, {
  ObjectSolutionCategoryMutator,
} from '../../../model/kanel/public/ObjectSolutionCategory';

export const objectSolutionCategoryDomain = {
  insertObjectSolutionCategory: async (
    field: ObjectSolutionCategoryMutator
  ) => {
    await db<ObjectSolutionCategory>('Object_SolutionCategory').insert(field);
  },

  deleteObjectSolutionCategoryBy: async (
    field: ObjectSolutionCategoryMutator
  ): Promise<void> => {
    await db<ObjectSolutionCategory>('Object_SolutionCategory')
      .where(field)
      .delete('*');
  },
};
