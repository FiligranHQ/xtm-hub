import {
  Resolvers,
  ShareableResource,
} from '../../../../__generated__/resolvers-types';

const resolvers: Resolvers = {
  OpenCTIPlaybook: {
    children_documents: async ({ id }, _, context) =>
      (await context.dataLoaders.document.imagesByDocumentIdLoader.load(
        id
      )) as unknown as ShareableResource[],
  },
};

export default resolvers;
