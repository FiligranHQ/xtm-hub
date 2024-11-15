import { graphql } from 'react-relay';

export const DocumentAddMutation = graphql`
  mutation documentAddMutation(
    $document: Upload
    $description: String
    $connections: [ID!]!
  ) {
    addDocument(document: $document, description: $description)
      @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      id
      description
      created_at
      file_name
    }
  }
`;

export const DocumentUpdateMutation = graphql`
  mutation documentUpdateMutation($documentId: ID, $newDescription: String) {
    editDocument(documentId: $documentId, newDescription: $newDescription) {
      id
      file_name
      created_at
      description
    }
  }
`;

export const DocumentDeleteMutation = graphql`
  mutation documentDeleteMutation($documentId: ID, $connections: [ID!]!) {
    deleteDocument(documentId: $documentId) {
      id @deleteEdge(connections: $connections)
      file_name
    }
  }
`;

export const DocumentExistsQuery = graphql`
  query documentExistsQuery($documentName: String) {
    documentExists(documentName: $documentName)
  }
`;

export const documentItem = graphql`
  fragment documentItem_fragment on Document {
    id
    file_name
    created_at
    description
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
  ) {
    ...documentsList
  }
`;
