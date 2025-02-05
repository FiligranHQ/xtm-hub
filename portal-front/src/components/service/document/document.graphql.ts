import { graphql } from 'react-relay';

export const DocumentAddMutation = graphql`
  mutation documentAddMutation(
    $document: Upload
    $name: String
    $description: String
    $serviceInstanceId: String
    $active: Boolean
    $parentDocumentId: ID
    $connections: [ID!]!
  ) {
    addDocument(
      document: $document
      name: $name
      description: $description
      serviceInstanceId: $serviceInstanceId
      active: $active
      parentDocumentId: $parentDocumentId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      ...documentItem_fragment @relay(mask: false)
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
    name
    description
    download_number
    active
    children_documents {
      id
      file_name
      created_at
      name
      description
      download_number
      active
    }
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
      parentDocumentId: $parentDocumentId
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
    $parentDocumentId: ID
  ) {
    ...documentsList
  }
`;
