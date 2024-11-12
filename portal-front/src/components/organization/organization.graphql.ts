import { graphql } from 'react-relay';

export const organizationsFragment = graphql`
  fragment organizationList_organizations on Query
  @refetchable(queryName: "OrganizationsPaginationQuery") {
    organizations(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          ...organizationItem_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const organizationItem = graphql`
  fragment organizationItem_fragment on Organization {
    id
    name
    domains
    personal_space
  }
`;
export const organizationFetch = graphql`
  query organizationSelectQuery(
    $count: Int
    $cursor: ID
    $orderBy: OrganizationOrdering!
    $orderMode: OrderingMode!
  ) {
    ...organizationList_organizations
  }
`;

export const organizationDeletion = graphql`
  mutation organizationDeletionMutation($id: ID!, $connections: [ID!]!) {
    deleteOrganization(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const CreateOrganizationMutation = graphql`
  mutation organizationCreateMutation($name: String!, $connections: [ID!]!) {
    addOrganization(name: $name)
      @prependNode(
        connections: $connections
        edgeTypeName: "OrganizationEdge"
      ) {
      id
      name
    }
  }
`;

export const OrganizationEditMutation = graphql`
  mutation organizationEditMutation($id: ID!, $input: EditOrganizationInput!) {
    editOrganization(id: $id, input: $input) {
      id
      name
    }
  }
`;
