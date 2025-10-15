import { graphql } from 'react-relay';

export const CsvFeedCreateMutation = graphql`
  mutation csvFeedCreateMutation(
    $input: CreateCsvFeedInput!
    $document: [Upload!]!
    $serviceInstanceId: String!
    $connections: [ID!]!
  ) {
    createCsvFeed(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      name
      ...csvFeedsItem_fragment
    }
  }
`;

export const CsvFeedUpdateMutation = graphql`
  mutation csvFeedUpdateMutation(
    $documentId: ID!
    $input: UpdateCsvFeedInput!
    $document: [Upload!]
    $updateDocument: Boolean!
    $images: [String!]
    $serviceInstanceId: String!
  ) {
    updateCsvFeed(
      documentId: $documentId
      input: $input
      document: $document
      updateDocument: $updateDocument
      images: $images
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      ...csvFeedsItem_fragment
    }
  }
`;

export const CsvFeedDeleteMutation = graphql`
  mutation csvFeedDeleteMutation(
    $documentId: ID!
    $connections: [ID!]!
    $serviceInstanceId: String!
  ) {
    deleteCsvFeed(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const csvFeedsItem = graphql`
  fragment csvFeedsItem_fragment on CsvFeed @inline {
    id
    type
    file_name
    created_at
    name
    short_description
    description
    download_number
    share_number
    active
    slug
    updated_at
    labels {
      id
      name
      color
    }
    uploader {
      id
      email
      first_name
      last_name
      picture
    }
    uploader_organization {
      id
      name
      personal_space
    }
    children_documents {
      id
      file_name
    }
    service_instance {
      id
      slug
    }
    subscription {
      id
    }
  }
`;
