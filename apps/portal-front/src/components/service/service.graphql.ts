import { graphql } from 'react-relay';

export const ServiceListCreateMutation = graphql`
  mutation serviceListMutation($input: AddServiceInput, $connections: [ID!]!) {
    addServiceInstance(input: $input)
      @prependNode(
        connections: $connections
        edgeTypeName: "ServiceInstanceEdge"
      ) {
      ...subscription_fragment
    }
  }
`;

export const ServiceAddPicture = graphql`
  mutation serviceAddPictureMutation(
    $serviceInstanceId: ID!
    $document: Upload
    $isLogo: Boolean
  ) {
    addServicePicture(
      serviceInstanceId: $serviceInstanceId
      document: $document
      isLogo: $isLogo
    ) {
      id
      name
    }
  }
`;

export const ServiceById = graphql`
  query serviceByIdQuery($service_instance_id: ID) {
    serviceInstanceById(service_instance_id: $service_instance_id) {
      ...serviceInstance_fragment
    }
  }
`;
export const serviceInstanceFragment = graphql`
  fragment serviceInstance_fragment on ServiceInstance {
    id
    name
    description
    slug
    capabilities
    service_definition {
      identifier
    }
  }
`;
export const serviceListFragment = graphql`
  fragment serviceList_fragment on ServiceInstance {
    id
    name
    description
    creation_status
    organization_subscribed
    user_joined
    capabilities
    public
    join_type
    tags
    links {
      name
      url
    }
    service_definition {
      id
      name
      identifier
    }
    logo_document_id
    illustration_document_id
    slug
    ordering
  }
`;

export const subscription = graphql`
  subscription serviceListSubscription($connections: [ID!]!) {
    ServiceInstance {
      add
        @prependNode(
          connections: $connections
          edgeTypeName: "ServiceInstanceEdge"
        ) {
        ...serviceList_fragment
      }
      edit {
        ...serviceList_fragment
      }
      delete {
        id @deleteRecord
      }
    }
  }
`;

export const servicesListFragment = graphql`
  fragment servicesList_services on Query
  @refetchable(queryName: "ServicesPaginationQuery") {
    serviceInstances(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          id
          ...serviceList_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const ServiceListQuery = graphql`
  query serviceQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceInstanceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...servicesList_services
  }
`;

export const ServiceByIdWithSubscriptions = graphql`
  query serviceByIdWithSubscriptionsQuery($service_instance_id: ID) {
    serviceInstanceByIdWithSubscriptions(
      service_instance_id: $service_instance_id
    ) {
      ...serviceWithSubscriptions_fragment @relay(mask: false)
    }
  }
`;

export const serviceWithSubscriptionsFragment = graphql`
  fragment serviceWithSubscriptions_fragment on ServiceInstance {
    __id
    name
    id
    description
    service_definition {
      service_capability {
        ...serviceCapability_fragment @relay(mask: false)
      }
    }
    subscriptions {
      ...subscriptionWithUserService_fragment @relay(mask: false)
    }
  }
`;

export const ServiceSelfJoinMutation = graphql`
  mutation serviceSelfJoinMutation($service_instance_id: ID!) {
    selfJoinServiceInstance(service_instance_id: $service_instance_id) {
      ...serviceInstance_fragment
    }
  }
`;
