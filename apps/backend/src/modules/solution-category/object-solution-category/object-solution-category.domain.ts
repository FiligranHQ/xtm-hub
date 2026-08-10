import { db } from '../../../../knexfile';
import ObjectSolutionCategory, {
  ObjectSolutionCategoryInitializer,
  ObjectSolutionCategoryMutator,
} from '../../../model/kanel/public/ObjectSolutionCategory';

export const objectSolutionCategoryDomain = {
  insertObjectSolutionCategory: async (
    initializer:
      ObjectSolutionCategoryInitializer | ObjectSolutionCategoryInitializer[]
  ) => {
    await db<ObjectSolutionCategory>('Object_SolutionCategory').insert(
      initializer
    );
  },

  deleteObjectSolutionCategoryBy: async (
    field: ObjectSolutionCategoryMutator
  ): Promise<void> => {
    await db<ObjectSolutionCategory>('Object_SolutionCategory')
      .where(field)
      .delete('*');
  },
};
