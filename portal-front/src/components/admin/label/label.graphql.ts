import { graphql } from 'react-relay';

export const labelFragment = graphql`
  fragment label_fragment on Label @inline {
    id
    name
    color
  }
`;

export const labelListFragment = graphql`
  fragment labelList_labels on Query
  @refetchable(queryName: "LabelsPaginationQuery") {
    labels(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          ...label_fragment
        }
      }
    }
  }
`;

export const LabelListQuery = graphql`
  query labelListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: LabelOrdering!
    $orderMode: OrderingMode!
  ) {
    ...labelList_labels
  }
`;

export const AddLabelMutation = graphql`
  mutation labelAddMutation(
    $input: AddLabelInput!
    $connections: [ID!]!
  ) {
    addLabel(input: $input)
    @prependNode(connections: $connections, edgeTypeName: "LabelEdge"){
      ...label_fragment
    }
  }
`;

export const EditLabelMutation = graphql`
  mutation labelEditMutation(
    $id: ID!
    $input: EditLabelInput!
  ) {
    editLabel(id: $id, input: $input){
      ...label_fragment
    }
  }
`;

export const DeleteLabelMutation = graphql`
  mutation labelDeleteMutation(
    $id: ID!
    $connections: [ID!]!
  ) {
    deleteLabel(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;