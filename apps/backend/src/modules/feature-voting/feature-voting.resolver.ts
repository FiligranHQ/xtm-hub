import { Resolvers } from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import { VotableFeatureId } from '../../model/kanel/public/VotableFeature';
import { VotingRoundId } from '../../model/kanel/public/VotingRound';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { DocumentDomain } from '../document/domain/document.domain';
import { featureVotingApp } from './feature-voting.app';

const resolvers: Resolvers = {
  VotableFeatureId: createRelayIdScalar<VotableFeatureId>('VotableFeature'),
  VotingRoundId: createRelayIdScalar<VotingRoundId>('VotingRound'),

  // Rounds come either with their features already resolved and filtered for
  // the audience, or as a bare row from the admin listing. Both fields fall
  // back to a query only when the value is missing, so listing rounds never
  // pays for feature bodies it will not render.
  VotingRound: {
    features: (round) =>
      round.features ?? featureVotingApp.loadRoundFeatures(round.id),
    feature_count: (round) =>
      round.feature_count ?? round.features?.length ?? 0,
  },

  // Features arrive from a round with their use cases already batched in. The
  // fallback only covers the features returned on their own, by a mutation.
  VotableFeature: {
    use_cases: (feature) =>
      feature.use_cases ?? featureVotingApp.loadFeatureUseCases(feature.id),
    illustration_document: async (feature) => {
      if (!feature.illustration_document_id) {
        return null;
      }
      const document = await DocumentDomain.loadDocumentBy({
        id: feature.illustration_document_id as DocumentId,
      });
      return document ?? null;
    },
  },

  Query: {
    currentVotingRound: (_, { service_instance_id }) =>
      featureVotingApp.loadCurrentVotingRound(service_instance_id),
    votingRounds: (_, { service_instance_id }) =>
      featureVotingApp.loadVotingRounds(service_instance_id),
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
    createVotableFeature: async (_, { input, document }) => {
      try {
        return await featureVotingApp.createVotableFeature(
          input,
          document ?? []
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.VotableFeatureMutationError
        );
      }
    },
    updateVotableFeature: async (_, { id, input, document }) => {
      try {
        return await featureVotingApp.updateVotableFeature(
          id,
          input,
          document ?? []
        );
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
