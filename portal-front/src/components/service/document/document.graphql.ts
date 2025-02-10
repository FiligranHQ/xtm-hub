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
      __id
      id
      name
      file_name
      ...documentItem_fragment
      ...customDashboardSheet_update_childs
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
    $forceDelete: Boolean
  ) {
    deleteDocument(
      documentId: $documentId
      serviceInstanceId: $serviceInstanceId
      forceDelete: $forceDelete
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
  fragment documentItem_fragment on Document @inline {
    id
    file_name
    created_at
    name
    description
    download_number
    active
    uploader {
      first_name
      last_name
    }
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
      parentsOnly: $parentsOnly
    ) {
      __id
      totalCount
      edges {
        node {
          id
          active
          ...documentItem_fragment
          ...customDashboardCard_update_childs
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
    $parentsOnly: Boolean
  ) {
    ...documentsList
  }
`;
