import { graphql } from 'react-relay';

export const customDashboardsItem = graphql`
  fragment customDashboardsItem_fragment on CustomDashboard @inline {
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
    use_cases {
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
    # Specific fields
    product_version
  }
`;

export const CustomDashboardQuery = graphql`
  query customDashboardQuery($documentId: ID, $serviceInstanceId: ID) {
    customDashboard(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...customDashboardsItem_fragment
    }
  }
`;
