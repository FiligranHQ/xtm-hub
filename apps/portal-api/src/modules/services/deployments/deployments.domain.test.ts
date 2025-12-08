import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as dbModule from '../../../../knexfile';
import { db } from '../../../../knexfile';
import { SIMPLE_USER_FILIGRAN_ID } from '../../../../tests/tests.const';
import {
  DeploymentRequestConnection,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  DeploymentRequestOrdering,
  OrderingMode,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest from '../../../model/kanel/public/DeploymentRequest';
import { UserId } from '../../../model/kanel/public/User';
import { deleteSubscriptionUnsecure } from '../../subcription/subscription.helper';
import { deleteServiceInstanceBy } from '../service-instance.domain';
import { DeploymentRequestDomain } from './deployments.domain';
import { insertOpenCtiDeploymentRequest } from './deployments.test.utils';

describe('DeploymentRequestDomain', () => {
  beforeEach(async () => {
    await db<DeploymentRequest>('DeploymentRequest').del();
  });
  describe('loadDeploymentRequestCountByRegion', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockDb: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        count: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue([]),
      };

      mockDb = vi.spyOn(dbModule, 'db');
      mockDb.mockReturnValue(mockQueryBuilder);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      {
        description: 'multiple regions',
        dbResults: [
          { region: 'us_east', count: '5' },
          { region: 'europe_west', count: '3' },
        ],
        expected: { us_east: 5, europe_west: 3 },
      },
      {
        description: 'empty results',
        dbResults: [],
        expected: {},
      },
      {
        description: 'zero counts',
        dbResults: [{ region: 'us_east', count: '0' }],
        expected: { us_east: 0 },
      },
    ])('should handle $description', async ({ dbResults, expected }) => {
      mockQueryBuilder.groupBy.mockResolvedValue(dbResults);

      const result =
        await DeploymentRequestDomain.loadDeploymentRequestCountByRegion({});

      expect(result).toEqual(expected);
    });
  });

  describe('loadDeploymentRequest', () => {
    afterEach(async () => {
      await DeploymentRequestDomain.deleteDeploymentRequestBy({});
      await deleteServiceInstanceBy({});
      await deleteSubscriptionUnsecure({});
    });

    it('should return filtered deployment requests', async () => {
      await insertOpenCtiDeploymentRequest({});
      await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
      });

      const deploymentRequests =
        await DeploymentRequestDomain.loadDeploymentRequests<DeploymentRequestConnection>(
          {
            first: 10,
            orderBy: DeploymentRequestOrdering.Ordering,
            orderMode: OrderingMode.Asc,
            filters: [
              {
                key: DeploymentRequestFilterKey.HubStatus,
                value: [DeploymentRequestHubStatus.Active],
              },
            ],
          }
        );

      expect(deploymentRequests.totalCount).toBe('1');
      expect(deploymentRequests.edges[0]?.node?.hub_status).toBe(
        DeploymentRequestHubStatus.Active
      );
    });
    it('should filter deployment requests when searchTerm is specified ', async () => {
      const deployment = await insertOpenCtiDeploymentRequest({});
      await insertOpenCtiDeploymentRequest({
        user_requester_id: SIMPLE_USER_FILIGRAN_ID as UserId,
      });

      const deploymentRequests =
        await DeploymentRequestDomain.loadDeploymentRequests<DeploymentRequestConnection>(
          {
            first: 10,
            orderBy: DeploymentRequestOrdering.Ordering,
            orderMode: OrderingMode.Asc,
            searchTerm: 'admin',
          }
        );

      expect(deploymentRequests.totalCount).toBe('1');
      expect(deploymentRequests.edges[0]?.node?.id).toBe(deployment?.id);
    });
    it('should return ordered deployment requests', async () => {
      const deployment1 = await insertOpenCtiDeploymentRequest({ ordering: 1 });
      const deployment2 = await insertOpenCtiDeploymentRequest({ ordering: 2 });

      const deploymentRequests =
        await DeploymentRequestDomain.loadDeploymentRequests<DeploymentRequestConnection>(
          {
            first: 10,
            orderBy: DeploymentRequestOrdering.Ordering,
            orderMode: OrderingMode.Asc,
          }
        );

      expect(deploymentRequests.totalCount).toBe('2');
      expect(deploymentRequests.edges[0]?.node?.id).toBe(deployment1?.id);
      expect(deploymentRequests.edges[1]?.node?.id).toBe(deployment2?.id);
    });
  });

  describe('reorderDeploymentRequestUp', () => {
    it('should do nothing when deployment request is the top one', async () => {
      const topDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 1,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 2,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestUp(
        topDeploymentRequest!
      );
      const resultDeploymentRequest = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .where({ id: topDeploymentRequest!.id })
        .select('*')
        .first();

      expect(resultDeploymentRequest).toBeDefined();
      expect(resultDeploymentRequest!.ordering).toBe(1);
    });

    it('should swap deployment request with the previous one', async () => {
      const previousDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 3,
      });
      const selectedDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 10,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestUp(
        selectedDeploymentRequest!
      );
      const resultPreviousDeploymentRequest = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .where({ id: previousDeploymentRequest!.id })
        .select('*')
        .first();

      const resultSelectedDeploymentRequest = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .where({ id: selectedDeploymentRequest!.id })
        .select('*')
        .first();

      expect(resultPreviousDeploymentRequest).toBeDefined();
      expect(resultPreviousDeploymentRequest!.ordering).toBe(10);

      expect(resultSelectedDeploymentRequest).toBeDefined();
      expect(resultSelectedDeploymentRequest!.ordering).toBe(3);
    });
  });

  describe('reorderDeploymentRequestToTop', async () => {
    it('should do nothing when deployment request is the top one', async () => {
      const topDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 1,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 2,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestToTop(
        topDeploymentRequest!
      );
      const resultDeploymentRequest = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .where({ id: topDeploymentRequest!.id })
        .select('*')
        .first();

      expect(resultDeploymentRequest).toBeDefined();
      expect(resultDeploymentRequest!.ordering).toBe(1);
    });

    it('should move deployment request to top', async () => {
      const topDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 3,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 4,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 5,
      });
      const selectedDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 6,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestToTop(
        selectedDeploymentRequest!
      );
      const resultSelectedDeploymentRequest = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .where({ id: selectedDeploymentRequest!.id })
        .select('*')
        .first();

      const resultTopDeploymentRequest = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .where({ id: topDeploymentRequest!.id })
        .select('*')
        .first();

      expect(resultSelectedDeploymentRequest).toBeDefined();
      expect(resultSelectedDeploymentRequest!.ordering).toBe(2);

      expect(resultTopDeploymentRequest).toBeDefined();
      expect(resultTopDeploymentRequest!.ordering).toBe(3);
    });
  });
});
