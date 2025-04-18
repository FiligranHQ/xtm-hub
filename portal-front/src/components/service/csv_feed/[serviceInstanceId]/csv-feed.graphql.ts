import { graphql } from 'react-relay';

export const CsvFeedCreateMutation = graphql`
  mutation csvFeedCreateMutation(
    $input: CsvFeedCreateInput!
    $document: Upload
    $serviceInstanceId: String
    $connections: [ID!]!
  ) {
    createCsvFeed(
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
