import { graphql } from 'react-relay';

export const ServiceInstancesSubscribedByIdentifierQuery = graphql`
  query serviceInstancesSubscribedByIdentifierQuery(
    $identifier: ServiceDefinitionIdentifier!
  ) {
    subscribedServiceInstancesByIdentifier(identifier: $identifier) {
      service_instance_id
      organization_id
      is_personal_space
      configurations {
        platform_id
      }
    }
  }
`;
