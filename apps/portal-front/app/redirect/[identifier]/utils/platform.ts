import { graphql } from 'react-relay';

export const PlatformAssociatedOrganizationQuery = graphql`
  query platformAssociatedOrganizationQuery($platformId: String!) {
    platformAssociatedOrganization(platformId: $platformId) {
      id
    }
  }
`;
