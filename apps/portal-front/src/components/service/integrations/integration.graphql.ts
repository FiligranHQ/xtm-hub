import { graphql } from 'react-relay';

export const integrationsItem = graphql`
  fragment integrationsItem_fragment on Integration @inline {
    __typename
    id
    active
    type
    file_name
    created_at
    name
    short_description
    description
    download_number
    share_number
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
    integration_type

    ...integrationConnectorsItem_fragment @relay(mask: false)
    ...integrationTaxiiFeedsItem_fragment @relay(mask: false)
    ...integrationStreamsItem_fragment @relay(mask: false)
  }
`;

export const taxiiFeedsItem = graphql`
  fragment integrationTaxiiFeedsItem_fragment on TaxiiFeed {
    integration_subtype
  }
`;

export const streamsItem = graphql`
  fragment integrationStreamsItem_fragment on Stream {
    integration_subtype
  }
`;

export const connectorsItem = graphql`
  fragment integrationConnectorsItem_fragment on Connector {
    verified
    product_version
    container_image
    source_code
    subscription_link
    integration_subtype
    manager_supported
    playbook_supported
  }
`;

export const integrationsFragment = graphql`
  fragment integrationsList on Query
  @refetchable(queryName: "IntegrationsPaginationQuery") {
    integrations(
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
          ...integrationsItem_fragment
        }
      }
    }
  }
`;

export const IntegrationsListQuery = graphql`
  query integrationsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...integrationsList
  }
`;

export const IntegrationQuery = graphql`
  query integrationQuery($documentId: ID, $serviceInstanceId: ID) {
    integration(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...integrationsItem_fragment
    }
  }
`;
