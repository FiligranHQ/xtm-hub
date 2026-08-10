import type { SolutionCategoryId } from './SolutionCategory';

/** Identifier type for public.Object_SolutionCategory */
export type ObjectSolutionCategoryObjectId = string & {
  __brand: 'public.Object_SolutionCategory';
};

/** Represents the table public.Object_SolutionCategory */
export default interface ObjectSolutionCategory {
  object_id: ObjectSolutionCategoryObjectId;

  solution_category_id: SolutionCategoryId;
}

/** Represents the initializer for the table public.Object_SolutionCategory */
export interface ObjectSolutionCategoryInitializer {
  object_id: ObjectSolutionCategoryObjectId;

  solution_category_id: SolutionCategoryId;
}

/** Represents the mutator for the table public.Object_SolutionCategory */
export interface ObjectSolutionCategoryMutator {
  object_id?: ObjectSolutionCategoryObjectId;

  solution_category_id?: SolutionCategoryId;
}
