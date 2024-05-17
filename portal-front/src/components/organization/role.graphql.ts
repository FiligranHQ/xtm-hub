import { graphql } from 'react-relay';

export const rolePortalFetch = graphql`
  query rolePortalQuery {
    rolesPortal {
      id
      name
    }
  }
`;
