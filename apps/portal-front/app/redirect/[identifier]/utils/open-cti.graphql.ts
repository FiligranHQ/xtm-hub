import { graphql } from 'react-relay';

export const OpenCTIPlatformAssociatedOrganization = graphql`
  query openCtiPlatformAssociatedOrganizationQuery($platformId: String!) {
    openCTIPlatformAssociatedOrganization(platformId: $platformId) {
      id
    }
  }
`;
