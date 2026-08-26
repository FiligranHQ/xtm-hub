import { graphql } from 'react-relay';

export const featureVotingFragment = graphql`
  fragment featureVoting_fragment on VotableFeature {
    id
    title
    short_description
    description
    product
    labels
    image_url
    position
    has_my_vote
  }
`;

export const FeatureVotingQuery = graphql`
  query featureVotingQuery {
    me {
      id
    }
    currentVotingRound {
      id
      name
      description
      features {
        id
        ...featureVoting_fragment @relay(mask: false)
      }
    }
  }
`;

export const FeatureVotingVoteMutation = graphql`
  mutation featureVotingVoteMutation($feature_id: VotableFeatureId!) {
    voteForFeature(feature_id: $feature_id) {
      id
      has_my_vote
    }
  }
`;
