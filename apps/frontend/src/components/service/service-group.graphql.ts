import { graphql } from 'react-relay';

export const serviceGroupFragment = graphql`
  fragment serviceGroup_fragment on ServiceGroup @inline {
    id
    name
    users {
      id
      email
    }
  }
`;

export const ServiceGroupsByServiceInstanceId = graphql`
  query serviceGroupsByServiceInstanceIdQuery(
    $serviceInstanceId: ServiceInstanceId!
  ) {
    serviceGroups(serviceInstanceId: $serviceInstanceId) {
      ...serviceGroup_fragment
    }
  }
`;

export const UpdateServiceGroupsMutation = graphql`
  mutation serviceGroupsUpdateMutation($input: UpdateServiceGroupsInput!) {
    updateServiceGroups(input: $input) {
      ...serviceGroup_fragment
    }
  }
`;
