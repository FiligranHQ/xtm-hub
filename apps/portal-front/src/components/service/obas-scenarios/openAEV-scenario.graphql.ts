import { graphql } from 'react-relay';

export const OpenAEVScenarioCreateMutation = graphql`
  mutation openAEVScenarioCreateMutation(
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
      ...openAEVScenariosItem_fragment
    }
  }
`;

export const OpenAEVScenarioUpdateMutation = graphql`
  mutation openAEVScenarioUpdateMutation(
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
      ...openAEVScenariosItem_fragment
    }
  }
`;

export const OpenAEVScenarioDeleteMutation = graphql`
  mutation openAEVScenarioDeleteMutation(
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

export const openAEVScenariosItem = graphql`
  fragment openAEVScenariosItem_fragment on OpenAEVScenario @inline {
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

export const openAEVScenariosFragment = graphql`
  fragment openAEVScenariosList on Query
  @refetchable(queryName: "ObasScenariosPaginationQuery") {
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
          ...openAEVScenariosItem_fragment
        }
      }
    }
  }
`;

export const OpenAEVScenariosListQuery = graphql`
  query openAEVScenariosQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...openAEVScenariosList
  }
`;

export const OpenAEVScenarioQuery = graphql`
  query openAEVScenarioQuery($documentId: ID, $serviceInstanceId: ID) {
    openAEVScenario(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...openAEVScenariosItem_fragment
    }
  }
`;
