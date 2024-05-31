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

export const organizationFragment = graphql`
  fragment organization_fragment on Organization {
    id
    name
  }
`;
