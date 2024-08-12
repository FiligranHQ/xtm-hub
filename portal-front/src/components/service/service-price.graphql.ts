import { graphql } from 'react-relay';

export const ServicePriceCreateMutation = graphql`
  mutation servicePriceMutation($input: AddServicePriceInput) {
    addServicePrice(input: $input) {
      id
    }
  }
`;
