import { graphql } from 'react-relay';

export const ReachSalesMutation = graphql`
  mutation reachSalesMutation {
    contactUs {
      success
    }
  }
`;
