import { graphql } from 'react-relay';

export const ContactUsMutation = graphql`
  mutation contactUsMutation {
    contactUs {
      success
    }
  }
`;
