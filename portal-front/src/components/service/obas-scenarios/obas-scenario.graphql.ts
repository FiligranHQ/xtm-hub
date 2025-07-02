import { graphql } from 'react-relay';

export const ObasScenarioCreateMutation = graphql`
  mutation obasScenarioCreateMutation(
    $input: CreateObasScenarioInput!
    $document: [Upload!]!
    $serviceInstanceId: String!
    $connections: [ID!]!
  ) {
    createObasScenario(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      name
      ...obasScenariosItem_fragment
    }
  }
`;

export const ObasScenarioUpdateMutation = graphql`
  mutation obasScenarioUpdateMutation(
    $documentId: ID!
    $input: UpdateObasScenarioInput!
    $document: [Upload!]
    $updateDocument: Boolean!
    $images: [String!]
    $serviceInstanceId: String!
  ) {
    updateObasScenario(
      documentId: $documentId
      input: $input
      document: $document
      updateDocument: $updateDocument
      images: $images
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      ...obasScenariosItem_fragment
    }
  }
`;

export const ObasScenarioDeleteMutation = graphql`
  mutation obasScenarioDeleteMutation(
    $documentId: ID!
    $connections: [ID!]!
    $serviceInstanceId: String!
  ) {
    deleteObasScenario(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const obasScenariosItem = graphql`
  fragment obasScenariosItem_fragment on ObasScenario @inline {
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

export const obasScenariosFragment = graphql`
  fragment obasScenariosList on Query
  @refetchable(queryName: "ObasScenariosPaginationQuery") {
    obasScenarios(
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
          ...obasScenariosItem_fragment
        }
      }
    }
  }
`;

export const ObasScenariosListQuery = graphql`
  query obasScenariosQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...obasScenariosList
  }
`;

export const ObasScenarioQuery = graphql`
  query obasScenarioQuery($documentId: ID, $serviceInstanceId: ID) {
    obasScenario(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...obasScenariosItem_fragment
    }
  }
`;
