import { graphql } from 'react-relay';

export const DocumentAddMutation = graphql`
  mutation documentAddMutation(
    $document: Upload
    $name: String
    $shortDescription: String
    $productVersion: String
    $description: String
    $serviceInstanceId: String
    $active: Boolean
    $parentDocumentId: ID
    $labels: [String!]
    $slug: String
    $connections: [ID!]!
  ) {
    addDocument(
      document: $document
      name: $name
      labels: $labels
      short_description: $shortDescription
      product_version: $productVersion
      description: $description
      service_instance_id: $serviceInstanceId
      active: $active
      parentDocumentId: $parentDocumentId
      slug: $slug
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
    $input: EditDocumentInput!
    $serviceInstanceId: String
  ) {
    editDocument(
      documentId: $documentId
      input: $input
      service_instance_id: $serviceInstanceId
    ) {
      id
      name
      file_name
      ...documentItem_fragment
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
      service_instance_id: $serviceInstanceId
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
      service_instance_id: $serviceInstanceId
    )
  }
`;

export const documentItem = graphql`
  fragment documentItem_fragment on Document @inline {
    id
    file_name
    created_at
    name
    short_description
    description
    product_version
    download_number
    active
    updated_at
    labels {
      id
      name
      color
    }
    uploader {
      first_name
      last_name
      picture
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
    slug
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
      searchTerm: $searchTerm
      filters: $filters
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
          ...customDashboardUpdate_update_childs
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
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
    $parentsOnly: Boolean
  ) {
    ...documentsList
  }
`;

export const DocumentQuery = graphql`
  query documentQuery($documentId: ID, $serviceInstanceId: ID) {
    document(documentId: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...documentItem_fragment
    }
  }
`;
