import { graphql } from 'react-relay';

export const changeSelectedOrganizationMutation = graphql`
  mutation organizationSwitcherMutation($organization_id: ID!) {
    changeSelectedOrganization(organization_id: $organization_id) {
      id
    }
  }
`;
