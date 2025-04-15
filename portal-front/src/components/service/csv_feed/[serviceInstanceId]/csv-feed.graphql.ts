import { graphql } from 'react-relay';

export const CsvFeedAddMutation = graphql`
  mutation csvFeedAddMutation(
    $input: CsvFeedAddInput!
    $document: Upload
    $serviceInstanceId: String
    $connections: [ID!]!
  ) {
    addCsvFeed(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      id
      name
      file_name
    }
  }
`;
