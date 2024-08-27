import { print } from 'graphql/language';
import gql from 'graphql-tag';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getAdminAgent } from '../../../tests/test.util';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { loadUnsecureServiceBy } from './services.domain';
import { loadUnsecureServicePriceBy } from './instances/service-price/service_price.helper';
import { loadUnsecureSubscriptionBy } from '../subcription/subscription.helper';
import { loadUnsecureUserServiceBy } from '../user_service/user-service.helper';
import { loadUnsecureServiceCapabilitiesBy } from './instances/service-capabilities/service_capabilities.helper';
import { deleteServiceUnsecure } from './services.helper';
import { loadUnsecureServiceLinkBy } from './instances/service-link/service_link.helper';

const serviceName = 'name_community_test';
const serviceDescription = 'short description test';
const servicePrice = 10;
const serviceFeeType = 'YEARLY';
const serviceLinks = ['OCTI', 'Nextcloud'];
const organizationList = [
  toGlobalId('Organization', 'ba091095-418f-4b4f-b150-6c9295e232c4'),
  toGlobalId('Organization', '681fb117-e2c3-46d3-945a-0e921b5d4b6c'),
];
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
      billing_manager: `{"id": "${toGlobalId('User', 'ba091095-418f-4b4f-b150-6c9295e232c3')}", "organization_id": "${toGlobalId('Organization', 'ba091095-418f-4b4f-b150-6c9295e232c4')}" }`,
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
    console.log('result', result);
  });
  it('Should return 200', () => {
    expect(response.status).toBe(200);
  });
  it('Should insert service with type community', async () => {
    const community = result.data.addServiceCommunity;

    expect(community).toEqual(
      expect.objectContaining({
        name: serviceName,
        description: serviceDescription,
        provider: 'SCRED_ONDEMAND',
        type: 'COMMUNITY',
        subscription_service_type: 'SUBSCRIPTABLE_BACKOFFICE',
      })
    );
  });

  it('Should insert ServicePrice ', async () => {
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

  it('Should insert Subscription, UserService and capabilities', async () => {
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
  it('should return communities', async () => {
    const response = await userAdmin
      .post('/graphql-api')
      .send(getCommunitiesTestQuery());
    const transform = JSON.parse(response.text);
    expect(transform.data.communities.edges.length).toEqual(1);
    expect(transform.data.communities.totalCount).toEqual(1);
  });
});