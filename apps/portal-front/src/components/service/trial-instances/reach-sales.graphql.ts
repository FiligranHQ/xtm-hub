import { graphql } from 'react-relay';

export const ReachSalesMutation = graphql`
  mutation reachSalesMutation($message: String) {
    contactUs(message: $message) {
      success
    }
  }
`;
