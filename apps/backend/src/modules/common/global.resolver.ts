import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { Resolvers } from '../../__generated__/resolvers-types';

const resolvers: Resolvers = {
  Upload: GraphQLUpload as unknown as Resolvers['Upload'],
};

export default resolvers;
