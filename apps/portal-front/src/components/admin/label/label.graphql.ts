import { graphql } from 'react-relay';

export const labelFragment = graphql`
  fragment label_fragment on UseCase @inline {
    id
    name
    color
  }
`;

export const labelListFragment = graphql`
  fragment labelList_labels on Query
  @refetchable(queryName: "UseCasesPaginationQuery") {
    useCases(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      searchTerm: $searchTerm
      documentType: $documentType
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
    $orderBy: UseCaseOrdering!
    $orderMode: OrderingMode!
    $searchTerm: String
    $documentType: String
  ) {
    ...labelList_labels
  }
`;

export const AddLabelMutation = graphql`
  mutation labelAddMutation($input: AddUseCaseInput!, $connections: [ID!]!) {
    addUseCase(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UseCaseEdge") {
      ...label_fragment
    }
  }
`;

export const EditLabelMutation = graphql`
  mutation labelEditMutation($id: ID!, $input: EditUseCaseInput!) {
    editUseCase(id: $id, input: $input) {
      ...label_fragment
    }
  }
`;

export const DeleteLabelMutation = graphql`
  mutation labelDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteUseCase(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;
