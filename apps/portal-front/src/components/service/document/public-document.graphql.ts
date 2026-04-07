import { graphql } from 'react-relay';

export const publicDocumentItem = graphql`
  fragment publicDocumentItemFragment on Document @inline {
    __typename
    id
    name
    description
    short_description
    created_at
    updated_at
    slug
    download_number
    share_number
    children_documents {
      id
      image_type
      source_type
    }
    use_cases {
      id
      name
      color
    }
    uploader {
      first_name
      last_name
      picture
    }
    active
    type
    uploader_organization {
      id
      personal_space
      name
    }

    ... on Integration {
      integration_type
      datasheet_url
      blogpost_url
      demo_url
    }

    ... on CustomDashboard {
      product_version
    }

    ... on CsvFeed {
      integration_type
      feed_url
    }

    ... on TaxiiFeed {
      integration_type
      feed_url
    }

    ... on RssFeed {
      integration_type
      integration_subtype
      feed_url
      datasheet_url
      blogpost_url
      demo_url
    }

    ... on Stream {
      integration_type
      feed_url
    }

    ... on ThirdPartyIntegration {
      integration_type
      integration_subtype
      product_version
      vendor_url
      github_url
    }

    ... on Connector {
      integration_type
      integration_subtype
      product_version
      container_image
      verified
      source_code
      subscription_link
      manager_supported
      playbook_supported
      minimum_deployable_version
    }

    ... on OpenAEVScenario {
      product_version
    }
  }
`;

export const PublicDocumentListFragment = graphql`
  fragment publicDocumentList on Query
  @refetchable(queryName: "PublicDocumentListQuery") {
    publicDocuments(
      slug: $slug
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      logicalFilters: $logicalFilters
      searchTerm: $searchTerm
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      totalCount
      edges {
        node {
          ...publicDocumentItemFragment
        }
      }
    }
  }
`;

export const PublicDocumentListQuery = graphql`
  query publicDocumentsQuery(
    $slug: String!
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $logicalFilters: LogicalFilterInput
    $searchTerm: String
    $serviceInstanceId: ServiceInstanceId!
  ) {
    ...publicDocumentList
  }
`;

export const PublicDocumentsByServiceSlugQuery = graphql`
  query publicDocumentsByServiceSlugQuery($serviceInstanceSlug: String!) {
    publicDocumentsByServiceSlug(serviceInstanceSlug: $serviceInstanceSlug) {
      ...publicDocumentItemFragment
    }
  }
`;

export const PublicDocumentBySlugQuery = graphql`
  query publicDocumentBySlugQuery(
    $serviceInstanceId: ServiceInstanceId!
    $slug: String!
  ) {
    publicDocumentBySlug(serviceInstanceId: $serviceInstanceId, slug: $slug) {
      ...publicDocumentItemFragment
    }
  }
`;
