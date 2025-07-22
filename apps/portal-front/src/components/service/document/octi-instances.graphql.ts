import { graphql } from 'react-relay';

export const OctiInstancesQuery = graphql`
  query octiInstancesQuery {
    octiInstances {
      id
      platform_id
      contract
      title
      url
    }
  }
`;
