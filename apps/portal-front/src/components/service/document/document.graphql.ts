import { graphql } from 'react-relay';

export const DocumentCreateMutation = graphql`
  mutation documentCreateMutation(
    $input: CreateDocumentInput!
    $metadata: [DocumentMetadata!]!
    $serviceInstanceId: String!
    $connections: [ID!]!
    $document: Upload
    $logo: Upload
    $images: [Upload!]
  ) {
    createDocument(
      input: $input
      metadata: $metadata
      serviceInstanceId: $serviceInstanceId
      document: $document
      logo: $logo
      images: $images
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      name
      ...documentItem_fragment
    }
  }
`;

export const DocumentUpdateMutation = graphql`
  mutation documentUpdateMutation(
    $documentId: ID!
    $input: UpdateDocumentInput!
    $metadata: [DocumentMetadata!]!
    $document: Upload
    $existingImageIds: [ID!]
    $serviceInstanceId: String!
    $logo: Upload
    $images: [Upload!]
  ) {
    updateDocument(
      documentId: $documentId
      input: $input
      document: $document
      metadata: $metadata
      existingImageIds: $existingImageIds
      serviceInstanceId: $serviceInstanceId
      logo: $logo
      images: $images
    ) {
      __id
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
    __typename
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
    updated_at
    use_cases {
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
      created_at
      name
      description
      download_number
      active
      source_type
      image_type
    }
    slug
    service_instance {
      id
      slug
    }
    subscription {
      id
    }

    ... on CustomDashboard {
      product_version
    }

    ... on CsvFeed {
      integration_type
      feed_url
      datasheet_url
      demo_url
    }

    ... on TaxiiFeed {
      integration_type
      integration_subtype
      feed_url
      datasheet_url
      demo_url
    }

    ... on Stream {
      integration_type
      integration_subtype
      feed_url
      datasheet_url
      demo_url
    }

    ... on ThirdPartyIntegration {
      integration_type
      integration_subtype
      product_version
      vendor_url
      github_url
      datasheet_url
      demo_url
    }

    ... on Connector {
      integration_type
      integration_subtype
      product_version
      container_image
      verified
      source_code
      subscription_link
      manager_supported
      playbook_supported
      datasheet_url
      demo_url
    }

    ... on OpenAEVScenario {
      product_version
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
      logicalFilters: $logicalFilters
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
    $logicalFilters: LogicalFilterInput
    $searchTerm: String
    $serviceInstanceId: String
    $parentsOnly: Boolean
  ) {
    ...documentsList
  }
`;

export const DocumentsItemQuery = graphql`
  query documentQuery($documentId: ID!, $serviceInstanceId: ID!) {
    document(documentId: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...documentItem_fragment
    }
  }
`;
