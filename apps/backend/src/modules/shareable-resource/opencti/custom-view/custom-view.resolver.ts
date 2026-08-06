import {
  Resolvers,
  ShareableResource,
} from '../../../../__generated__/resolvers-types';
import { DocumentChildrenDomain } from '../../../document/domain/document.children.domain';

const parseEntityTypes = (entityTypes: unknown): string[] => {
  if (!entityTypes) return [];
  if (Array.isArray(entityTypes)) return entityTypes as string[];
  try {
    const parsed = JSON.parse(entityTypes as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolvers: Resolvers = {
  CustomView: {
    entity_types: ({ entity_types }) => parseEntityTypes(entity_types),
    children_documents: async ({ id }) =>
      (await DocumentChildrenDomain.loadImagesByDocumentId(
        id
      )) as unknown as ShareableResource[],
  },
};

export default resolvers;
