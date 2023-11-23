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