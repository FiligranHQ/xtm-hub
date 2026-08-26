import { Resolvers } from '../../__generated__/resolvers-types';
import { VotableFeatureId } from '../../model/kanel/public/VotableFeature';
import { VotingRoundId } from '../../model/kanel/public/VotingRound';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { featureVotingApp } from './feature-voting.app';

const resolvers: Resolvers = {
  VotableFeatureId: createRelayIdScalar<VotableFeatureId>('VotableFeature'),
  VotingRoundId: createRelayIdScalar<VotingRoundId>('VotingRound'),

  Query: {
    currentVotingRound: () => featureVotingApp.loadCurrentVotingRound(),
    votingRounds: () => featureVotingApp.loadVotingRounds(),
    votingRound: (_, { id }) => featureVotingApp.loadVotingRound(id),
    votingRoundResults: (_, { id }) =>
      featureVotingApp.loadVotingRoundResults(id),
  },

  Mutation: {
    voteForFeature: async (_, { feature_id }) => {
      try {
        return await featureVotingApp.voteForFeature(feature_id);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.VoteForFeatureError);
      }
    },
    createVotingRound: async (_, { input }) => {
      try {
        return await featureVotingApp.createVotingRound(input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotingRoundMutationError
        );
      }
    },
    updateVotingRound: async (_, { id, input }) => {
      try {
        return await featureVotingApp.updateVotingRound(id, input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotingRoundMutationError
        );
      }
    },
    setVotingRoundStatus: async (_, { id, status }) => {
      try {
        return await featureVotingApp.setVotingRoundStatus(id, status);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotingRoundMutationError
        );
      }
    },
    deleteVotingRound: async (_, { id }) => {
      try {
        return await featureVotingApp.deleteVotingRound(id);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotingRoundMutationError
        );
      }
    },
    createVotableFeature: async (_, { input }) => {
      try {
        return await featureVotingApp.createVotableFeature(input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotableFeatureMutationError
        );
      }
    },
    updateVotableFeature: async (_, { id, input }) => {
      try {
        return await featureVotingApp.updateVotableFeature(id, input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotableFeatureMutationError
        );
      }
    },
    deleteVotableFeature: async (_, { id }) => {
      try {
        return await featureVotingApp.deleteVotableFeature(id);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotableFeatureMutationError
        );
      }
    },
  },
};

export default resolvers;
