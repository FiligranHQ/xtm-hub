import { graphql } from 'react-relay';

export const ServiceCapabilityCreateMutation = graphql`
  mutation serviceCapabilityMutation(
    $input: EditServiceCapabilityInput
    $connections: [ID!]!
  ) {
    editServiceCapability(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UserServiceEdge") {
      id
      user {
        id
        last_name
        first_name
        email
      }
      service_capability {
        id
        service_capability_name
      }
      subscription {
        id
        organization {
          name
          id
        }
        service {
          name
          id
        }
      }
    }
  }
`;
