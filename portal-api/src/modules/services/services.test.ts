import 'knex';
import gql from 'graphql-tag';
import { print } from 'graphql/language';
import { getAdminAgent } from '../../../tests/test.util';
import { describe, expect, it } from 'vitest';

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
            status
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
