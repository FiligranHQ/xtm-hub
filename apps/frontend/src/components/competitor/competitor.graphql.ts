import { graphql } from 'react-relay';

export const competitorFragment = graphql`
  fragment competitor_fragment on Competitor @inline {
    id
    name
    domain
    tier
  }
`;

export const competitorListFragment = graphql`
  fragment competitor_list_fragment on Query
  @refetchable(queryName: "CompetitorPaginationQuery") {
    competitors(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          ...competitor_fragment
        }
      }
    }
  }
`;

export const CompetitorListQuery = graphql`
  query competitorListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: CompetitorOrdering!
    $orderMode: OrderingMode!
  ) {
    ...competitor_list_fragment
  }
`;

export const CompetitorAddMutation = graphql`
  mutation competitorAddMutation(
    $input: CreateCompetitorInput!
    $connections: [ID!]!
  ) {
    createCompetitor(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "CompetitorEdge") {
      ...competitor_fragment
    }
  }
`;

export const CompetitorEditMutation = graphql`
  mutation competitorEditMutation($input: UpdateCompetitorInput!) {
    updateCompetitor(input: $input) {
      ...competitor_fragment
    }
  }
`;

export const CompetitorDeleteMutation = graphql`
  mutation competitorDeleteMutation($id: CompetitorId!, $connections: [ID!]!) {
    deleteCompetitor(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;
