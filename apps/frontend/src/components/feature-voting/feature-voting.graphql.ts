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
  query featureVotingQuery($service_instance_id: ServiceInstanceId!) {
    me {
      id
    }
    currentVotingRound(service_instance_id: $service_instance_id) {
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

export const FeatureVotingCalloutQuery = graphql`
  query featureVotingCalloutQuery($service_instance_id: ServiceInstanceId!) {
    currentVotingRound(service_instance_id: $service_instance_id) {
      id
      name
      description
      theme
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
