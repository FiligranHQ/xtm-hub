import { graphql } from 'react-relay';

export const openaevScenariosItem = graphql`
  fragment openaevScenariosItem_fragment on OpenAEVScenario @inline {
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
    product_version
  }
`;

export const OpenaevScenarioQuery = graphql`
  query openaevScenarioQuery($documentId: ID, $serviceInstanceId: ID) {
    openAEVScenario(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...openaevScenariosItem_fragment
    }
  }
`;
