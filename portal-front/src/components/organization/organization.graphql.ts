import { graphql } from 'react-relay';

export const organizationFetch = graphql`
  query organizationSelectQuery {
    organizations {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const organizationDeletion = graphql`
  mutation organizationDeletionMutation($id: ID!) {
    deleteOrganization(id: $id) {
      id
    }
  }
`;

export const CreateOrganizationMutation = graphql`
  mutation organizationCreateMutation($name: String!, $connections: [ID!]!) {
    addOrganization(name: $name)
      @prependNode(
        connections: $connections
        edgeTypeName: "OrganizationsEdge"
      ) {
      id
      name
    }
  }
`;

export const OrganizationEditMutation = graphql`
  mutation organizationEditMutation($id: ID!, $input: EditOrganizationInput!) {
    editOrganization(id: $id, input: $input) {
      id
      name
    }
  }
`;
