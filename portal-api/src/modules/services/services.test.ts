import { print } from 'graphql/language';
import gql from 'graphql-tag';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getAdminAgent } from '../../../tests/test.util';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { loadUnsecureServiceBy } from './services.domain';
import { loadUnsecureServicePriceBy } from './instances/service-price/service_price.helper';
import {
  deleteSubscriptionUnsecure,
  insertUnsecureSubscription,
  loadUnsecureSubscriptionBy,
} from '../subcription/subscription.helper';
import { loadUnsecureUserServiceBy } from '../user_service/user-service.helper';
import { loadUnsecureServiceCapabilitiesBy } from './instances/service-capabilities/service_capabilities.helper';
import { deleteServiceUnsecure } from './services.helper';
import { loadUnsecureServiceLinkBy } from './instances/service-link/service_link.helper';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceId } from '../../model/kanel/public/Service';

const serviceName = 'name_community_test';
const serviceDescription = 'short description test';
const servicePrice = 10;
const serviceFeeType = 'YEARLY';
const serviceLinks = ['OCTI', 'Nextcloud'];
const organizationList = [
  toGlobalId('Organization', 'ba091095-418f-4b4f-b150-6c9295e232c4'),
  toGlobalId('Organization', '681fb117-e2c3-46d3-945a-0e921b5d4b6c'),
];

const getServiceTestQuery = (serviceId) => ({
  query: print(gql`
    query serviceByIdQuery($service_id: ID) {
      serviceById(service_id: $service_id) {
        id
        name
      }
    }
  `),
  variables: {
    service_id: serviceId,
  },
});
const addServiceTestQuery = {
  query: print(gql`
    mutation serviceCommunityListMutation($input: AddServiceCommunityInput) {
      addServiceCommunity(input: $input) {
        id
        name
        description
        provider
        type
        subscription_service_type
        creation_status
      }
    }
  `),
  variables: {
    input: {
      community_name: serviceName,
      community_description: serviceDescription,
      price: servicePrice,
      fee_type: serviceFeeType,
      organizations_id: organizationList,
      billing_manager: `{
      "id": "${toGlobalId('User', 'ba091095-418f-4b4f-b150-6c9295e232c3')}", 
      "organization_id": "${toGlobalId('Organization', 'ba091095-418f-4b4f-b150-6c9295e232c4')}" }`,
    },
  },
};

describe('Admin can create communities ', () => {
  let userAdmin;
  let response;
  let result;

  let service;
  let subscriptions;

  beforeAll(async () => {
    userAdmin = await getAdminAgent();
    response = await userAdmin.post('/graphql-api').send(addServiceTestQuery);
    result = JSON.parse(response.text);
  });
  it('Should return 200', () => {
    expect(response.status).toBe(200);
  });
  it('Should insert service with type community ', async () => {
    const community = result.data.addServiceCommunity;

    expect(community).toEqual(
      expect.objectContaining({
        name: serviceName,
        description: serviceDescription,
        provider: 'SCRED_ONDEMAND',
        type: 'COMMUNITY',
        subscription_service_type: 'SUBSCRIPTABLE_DIRECT',
      })
    );
  });

  it('Should insert ServicePrice', async () => {
    const [loadedService] = await loadUnsecureServiceBy({
      name: serviceName,
    });
    service = loadedService;
    const [loadedServicePrice] = await loadUnsecureServicePriceBy({
      service_id: service.id,
    });
    expect(loadedServicePrice.fee_type).toEqual(serviceFeeType);
    expect(loadedServicePrice.price).toEqual(servicePrice);
    expect(loadedServicePrice.service_id).toEqual(service.id);
  });

  it('Should insert Subscription, UserService and capabilities ', async () => {
    const loadedSubscriptions = await loadUnsecureSubscriptionBy({
      service_id: service.id,
    });
    subscriptions = loadedSubscriptions;
    expect(subscriptions.length).toEqual(organizationList.length);
    subscriptions.forEach((sub) => {
      expect(sub.service_id).toEqual(service.id);
      expect(sub.status).toEqual('ACCEPTED');
    });
  });

  it('should insert userService and serviceCapabilities', async () => {
    for (const sub of subscriptions) {
      const loadedUserServices = await loadUnsecureUserServiceBy({
        subscription_id: sub.id,
      });

      expect(loadedUserServices.length).toEqual(2);
      for (const userService of loadedUserServices) {
        const loadedCapabilities = await loadUnsecureServiceCapabilitiesBy({
          user_service_id: userService.id,
        });
        expect(loadedCapabilities.length).toBeGreaterThan(0);
      }
    }
  });

  for (const link of serviceLinks) {
    it(`Should insert ServiceLinks for ${link}`, async () => {
      const [loadedServiceLink] = await loadUnsecureServiceLinkBy({
        name: link,
      });
      expect(loadedServiceLink).toEqual(
        expect.objectContaining({
          name: link,
          url: null,
        })
      );
    });
  }

  afterAll(async () => {
    await deleteServiceUnsecure({ name: serviceName });
  });
});

const getCommunitiesTestQuery = () => ({
  query: print(gql`
    query serviceCommunitiesQuery(
      $count: Int!
      $cursor: ID
      $orderBy: ServiceOrdering!
      $orderMode: OrderingMode!
    ) {
      communities(
        first: $count
        after: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      ) {
        totalCount
        edges {
          node {
            id
            name
            description
            provider
            type
            subscription_service_type
            creation_status
            subscription {
              id
              status
              organization {
                name
              }
            }
          }
        }
      }
    }
  `),
  variables: {
    count: 50,
    orderBy: 'name',
    orderMode: 'asc',
  },
});

describe('Should return community list', async () => {
  const userAdmin = await getAdminAgent();
  const createThalesSubscription = {
    id: uuidv4() as SubscriptionId,
    organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c' as OrganizationId,
    service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf' as ServiceId,
  };
  beforeAll(async () => {
    await insertUnsecureSubscription(createThalesSubscription);
  });
  it('should return communities', async () => {
    const response = await userAdmin
      .post('/graphql-api')
      .send(getCommunitiesTestQuery());
    const transform = JSON.parse(response.text);
    expect(transform.data.communities.edges.length).toEqual(1);
    expect(transform.data.communities.totalCount).toEqual(1);
    expect(
      transform.data.communities.edges[0].node.subscription.length
    ).toEqual(3);
  });
  afterAll(async () => {
    await deleteSubscriptionUnsecure(createThalesSubscription.id);
  });
});

describe('Should return service By Id', async () => {
  const userAdmin = await getAdminAgent();
  it('should return the right service ', async () => {
    const response = await userAdmin
      .post('/graphql-api')
      .send(
        getServiceTestQuery(
          toGlobalId('Service', 'c6343882-f609-4a3f-abe0-a34f8cb11302')
        )
      );
    expect(response.status).toBe(200);

    const transform = JSON.parse(response.text);
    expect(transform.data.serviceById.name).toEqual('CyberWeather');
    expect(fromGlobalId(transform.data.serviceById.id).id).toEqual(
      'c6343882-f609-4a3f-abe0-a34f8cb11302'
    );
  });
});

describe('Admin should create Community for another organization', async () => {
  let response;
  let result;
  const userAdmin = await getAdminAgent();
  const community_name = 'Create community for Thales';
  const community_description =
    'Create community for Thales from the Admin Internal';
  beforeAll(async () => {
    response = await userAdmin.post('/graphql-api').send({
      ...addServiceTestQuery,
      variables: {
        ...addServiceTestQuery.variables,
        input: {
          ...addServiceTestQuery.variables.input,
          community_name,
          community_description,
          organizations_id: [
            toGlobalId('Organization', '681fb117-e2c3-46d3-945a-0e921b5d4b6c'),
          ],
          billing_manager: `{
            "id": "${toGlobalId('User', '015c0488-848d-4c89-95e3-8a243971f594')}", 
            "organization_id": "${toGlobalId('Organization', '681fb117-e2c3-46d3-945a-0e921b5d4b6c')}" }`,
        },
      },
    });
    result = JSON.parse(response.text);
  });
  it('Should return 200', () => {
    expect(response.status).toBe(200);
  });
  it('Should insert service with type community ', async () => {
    const community = result.data.addServiceCommunity;
    expect(community).toEqual(
      expect.objectContaining({
        name: community_name,
        description: community_description,
        provider: 'SCRED_ONDEMAND',
        type: 'COMMUNITY',
        subscription_service_type: 'SUBSCRIPTABLE_DIRECT',
      })
    );
  });
  afterAll(async () => {
    await deleteServiceUnsecure({ name: community_name });
  });
});

describe('Admin should not create Community for organization with billing manager that having a different organization', async () => {
  let response;
  let result;
  const userAdmin = await getAdminAgent();
  const community_name = 'Create community for Thales';
  const community_description =
    'Create community for Thales from the Admin Internal and billing Internal';
  beforeAll(async () => {
    response = await userAdmin.post('/graphql-api').send({
      ...addServiceTestQuery,
      variables: {
        ...addServiceTestQuery.variables,
        input: {
          ...addServiceTestQuery.variables.input,
          community_name,
          community_description,
          organizations_id: [
            toGlobalId('Organization', '681fb117-e2c3-46d3-945a-0e921b5d4b6c'),
          ],
        },
      },
    });
    result = JSON.parse(response.text);
  });
  it('Should return 200', () => {
    expect(response.status).toBe(200);
  });
  it('Should not insert service with type community and throw error', async () => {
    const community = result.data.addServiceCommunity;
    expect(community).toEqual(null);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        message: 'The billing manager and the organization should be the same.',
      })
    );
  });
});
