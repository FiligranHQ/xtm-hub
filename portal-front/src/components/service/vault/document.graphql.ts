import { graphql } from 'react-relay';

export const DocumentAddMutation = graphql`
  mutation documentAddMutation(
    $document: Upload
    $description: String
    $serviceInstanceId: String
    $connections: [ID!]!
  ) {
    addDocument(
      document: $document
      description: $description
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      id
      description
      created_at
      file_name
      download_number
    }
  }
`;

export const DocumentUpdateMutation = graphql`
  mutation documentUpdateMutation(
    $documentId: ID
    $newDescription: String
    $serviceInstanceId: String
  ) {
    editDocument(
      documentId: $documentId
      newDescription: $newDescription
      serviceInstanceId: $serviceInstanceId
    ) {
      id
      file_name
      created_at
      description
      download_number
    }
  }
`;

export const DocumentDeleteMutation = graphql`
  mutation documentDeleteMutation(
    $documentId: ID
    $connections: [ID!]!
    $serviceInstanceId: String
  ) {
    deleteDocument(
      documentId: $documentId
      serviceInstanceId: $serviceInstanceId
    ) {
      id @deleteEdge(connections: $connections)
      file_name
    }
  }
`;

export const DocumentExistsQuery = graphql`
  query documentExistsQuery($documentName: String, $serviceInstanceId: String) {
    documentExists(
      documentName: $documentName
      serviceInstanceId: $serviceInstanceId
    )
  }
`;

export const documentItem = graphql`
  fragment documentItem_fragment on Document {
    id
    file_name
    created_at
    description
    download_number
  }
`;
export const documentsFragment = graphql`
  fragment documentsList on Query
  @refetchable(queryName: "DocumentsPaginationQuery") {
    documents(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filter: $filter
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      totalCount
      edges {
        node {
          ...documentItem_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const DocumentsListQuery = graphql`
  query documentsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filter: String
    $serviceInstanceId: String
  ) {
    ...documentsList
  }
`;
