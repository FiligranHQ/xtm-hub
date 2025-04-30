import { graphql } from 'react-relay';

export const DocumentAddMutation = graphql`
  mutation documentAddMutation(
    $document: Upload
    $name: String
    $shortDescription: String
    $description: String
    $serviceInstanceId: String
    $active: Boolean
    $parentDocumentId: ID
    $labels: [String!]
    $slug: String
    $connections: [ID!]!
    $type: String!
  ) {
    addDocument(
      document: $document
      name: $name
      labels: $labels
      short_description: $shortDescription
      description: $description
      service_instance_id: $serviceInstanceId
      active: $active
      parentDocumentId: $parentDocumentId
      slug: $slug
      type: $type
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      id
      name
      file_name
      ...documentItem_fragment
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

export const DocumentDetailDeleteMutation = graphql`
  mutation documentDetailDeleteMutation(
    $documentId: ID
    $serviceInstanceId: String
    $forceDelete: Boolean
  ) {
    deleteDocument(
      documentId: $documentId
      service_instance_id: $serviceInstanceId
      forceDelete: $forceDelete
    ) {
      id
      file_name
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
    download_number
    share_number
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
    uploader_organization {
      id
      name
      personal_space
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
    service_instance {
      id
      slug
    }
    subscription {
      id
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
