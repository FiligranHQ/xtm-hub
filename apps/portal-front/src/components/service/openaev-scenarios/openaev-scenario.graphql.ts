import { graphql } from 'react-relay';

export const OpenaevScenarioCreateMutation = graphql`
  mutation openaevScenarioCreateMutation(
    $input: CreateOpenAEVScenarioInput!
    $document: [Upload!]!
    $serviceInstanceId: String!
    $connections: [ID!]!
  ) {
    createOpenAEVScenario(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      name
      ...openaevScenariosItem_fragment
    }
  }
`;

export const OpenaevScenarioUpdateMutation = graphql`
  mutation openaevScenarioUpdateMutation(
    $documentId: ID!
    $input: UpdateOpenAEVScenarioInput!
    $document: [Upload!]
    $updateDocument: Boolean!
    $images: [String!]
    $serviceInstanceId: String!
  ) {
    updateOpenAEVScenario(
      documentId: $documentId
      input: $input
      document: $document
      updateDocument: $updateDocument
      images: $images
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      ...openaevScenariosItem_fragment
    }
  }
`;

export const OpenaevScenarioDeleteMutation = graphql`
  mutation openaevScenarioDeleteMutation(
    $documentId: ID!
    $connections: [ID!]!
    $serviceInstanceId: String!
  ) {
    deleteOpenAEVScenario(
      id: $documentId
      serviceInstanceId: $serviceInstanceId
    ) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const openaevScenariosItem = graphql`
  fragment openaevScenariosItem_fragment on OpenAEVScenario @inline {
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
    product_version
  }
`;

export const openaevScenariosFragment = graphql`
  fragment openaevScenariosList on Query
  @refetchable(queryName: "OpenAEVScenariosPaginationQuery") {
    openAEVScenarios(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      searchTerm: $searchTerm
      filters: $filters
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      totalCount
      edges {
        node {
          id
          active
          ...openaevScenariosItem_fragment
        }
      }
    }
  }
`;

export const OpenaevScenariosListQuery = graphql`
  query openaevScenariosQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...openaevScenariosList
  }
`;

export const OpenaevScenarioQuery = graphql`
  query openaevScenarioQuery($documentId: ID, $serviceInstanceId: ID) {
    openAEVScenario(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...openaevScenariosItem_fragment
    }
  }
`;
