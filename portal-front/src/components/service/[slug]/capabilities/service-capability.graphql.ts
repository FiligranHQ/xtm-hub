import { graphql } from 'react-relay';

export const ServiceCapabilityCreateMutation = graphql`
  mutation serviceCapabilityMutation($input: EditServiceCapabilityInput) {
    editServiceCapability(input: $input) {
      id
      organization {
        name
      }
      user_service {
        ...userService_fragment @relay(mask: false)
      }
      service_instance {
        id
        name
        description
      }
    }
  }
`;

export const serviceCapabilityFragment = graphql`
  fragment serviceCapability_fragment on ServiceCapability {
    id
    description
    name
  }
`;
