import { graphql } from 'react-relay';

export const useCaseFragment = graphql`
  fragment useCase_fragment on UseCase @inline {
    id
    name
    color
  }
`;

export const useCaseListFragment = graphql`
  fragment useCase_list_fragment on Query
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
          ...useCase_fragment
        }
      }
    }
  }
`;

export const UseCaseListQuery = graphql`
  query useCaseListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UseCaseOrdering!
    $orderMode: OrderingMode!
    $searchTerm: String
    $documentType: String
  ) {
    ...useCase_list_fragment
  }
`;

export const AddUseCaseMutation = graphql`
  mutation useCaseAddMutation($input: AddUseCaseInput!, $connections: [ID!]!) {
    addUseCase(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UseCaseEdge") {
      ...useCase_fragment
    }
  }
`;

export const EditUseCaseMutation = graphql`
  mutation useCaseEditMutation($id: ID!, $input: EditUseCaseInput!) {
    editUseCase(id: $id, input: $input) {
      ...useCase_fragment
    }
  }
`;

export const DeleteUseCaseMutation = graphql`
  mutation useCaseDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteUseCase(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;
