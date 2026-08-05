import SolutionCategory, {
  SolutionCategoryId,
} from '../../model/kanel/public/SolutionCategory';

export const normalizeSolutionCategoryName = (name: string): string =>
  name.trim().toLowerCase();

export const buildSolutionCategoryIndex = (
  categories: SolutionCategory[],
  product: string
): Map<string, SolutionCategoryId> => {
  const index = new Map<string, SolutionCategoryId>();

  for (const category of categories) {
    if (!(category.product as string[]).includes(product)) {
      continue;
    }

    const key = normalizeSolutionCategoryName(category.name);
    if (!index.has(key)) {
      index.set(key, category.id);
    }
  }

  return index;
};

export const resolveSolutionCategoryNames = (
  names: readonly string[],
  index: Map<string, SolutionCategoryId>
): { resolved: SolutionCategoryId[]; unknown: string[] } => {
  const resolved = new Set<SolutionCategoryId>();
  const unknown = new Set<string>();

  for (const name of names) {
    const id = index.get(normalizeSolutionCategoryName(name));
    if (id) {
      resolved.add(id);
    } else {
      unknown.add(name);
    }
  }

  return { resolved: [...resolved], unknown: [...unknown] };
};
