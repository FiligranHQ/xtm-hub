import { graphql } from 'react-relay';

export const epicFragment = graphql`
  fragment epic_fragment on Epic {
    id
    short_description
    description
    epic
    title
    timeline
    product
    active
    epic_type
    document_id
  }
`;

export const epicsListFragment = graphql`
  fragment epicsList_epics on Query
  @refetchable(queryName: "EpicPaginationQuery") {
    epics(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      edges {
        node {
          id
          ...epic_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const EpicListQuery = graphql`
  query epicsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: EpicOrdering!
    $orderMode: OrderingMode!
  ) {
    ...epicsList_epics
  }
`;

export const CreateEpicMutation = graphql`
  mutation epicCreateMutation(
    $input: CreateEpicInput!
    $document: [Upload!]
    $connections: [ID!]!
  ) {
    createEpic(input: $input, document: $document)
      @prependNode(connections: $connections, edgeTypeName: "EpicEdge") {
      ...epic_fragment
    }
  }
`;

export const UpdateEpicMutation = graphql`
  mutation epicUpdateMutation(
    $id: ID!
    $input: UpdateEpicInput!
    $document: [Upload!]
  ) {
    updateEpic(id: $id, input: $input, document: $document) {
      ...epic_fragment
    }
  }
`;

export const DeleteEpicMutation = graphql`
  mutation epicDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteEpic(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;
