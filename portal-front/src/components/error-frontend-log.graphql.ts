import { Environment, graphql } from 'react-relay';
import { commitMutation } from 'relay-runtime';

const errorFrontendLogMutation = graphql`
  mutation errorFrontendLogMutation(
    $message: String!
    $codeStack: String
    $componentStack: String
  ) {
    frontendErrorLog(
      message: $message
      codeStack: $codeStack
      componentStack: $componentStack
    )
  }
`;

export const logFrontendError = (
  environment: Environment,
  message: string,
  codeStack?: string,
  componentStack?: string
) => {
  return commitMutation(environment, {
    mutation: errorFrontendLogMutation,
    variables: {
      message,
      codeStack,
      componentStack,
    },
    onCompleted: (response) => {
      console.log('Error logged successfully:', response);
    },
    onError: (err) => {
      console.error('Error logging failed:', err);
    },
  });
};
