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
