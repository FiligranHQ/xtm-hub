import { graphql } from 'react-relay';

export const PlatformAssociatedOrganizationQuery = graphql`
  query platformAssociatedOrganizationQuery(
    $platformId: String!
    $tenantId: String
  ) {
    platformAssociatedOrganization(
      platformId: $platformId
      tenantId: $tenantId
    ) {
      id
    }
  }
`;