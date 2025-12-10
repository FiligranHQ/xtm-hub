import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as dbModule from '../../../../knexfile';
import { db } from '../../../../knexfile';
import { SIMPLE_USER_FILIGRAN_ID } from '../../../../tests/tests.const';
import {
  DeploymentRequestConnection,
  DeploymentRequestDeploymentType,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  DeploymentRequestOrdering,
  OrderingMode,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest from '../../../model/kanel/public/DeploymentRequest';
import { UserId } from '../../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
} from '../../../model/kanel/public/UserOrganization';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
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

  describe('loadProvisionedTrialDeploymentRequestByPlatformIdentifier', () => {
    afterEach(async () => {
      await db<UserOrganization>('User_Organization').delete();
      await DeploymentRequestDomain.deleteDeploymentRequestBy({});
      await deleteServiceInstanceBy({});
      await deleteSubscriptionUnsecure({});
    });

    it('should return deployment request when Active trial deployment exists for user', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      const userId = ADMIN_UUID as UserId;

      const deployment = await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      await db<UserOrganization>('User_Organization').insert({
        user_id: userId,
        organization_id: PLATFORM_ORGANIZATION_UUID,
      } as UserOrganizationInitializer);

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeDefined();
      expect(result?.id).toBe(deployment.id);
      expect(result?.platform_identifier).toBe(platformIdentifier);
      expect(result?.hub_status).toBe(DeploymentRequestHubStatus.Active);
    });

    it('should return deployment request when Expired trial deployment exists for user', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      const userId = ADMIN_UUID as UserId;

      const deployment = await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Expired,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      await db<UserOrganization>('User_Organization').insert({
        user_id: userId,
        organization_id: PLATFORM_ORGANIZATION_UUID,
      } as UserOrganizationInitializer);

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeDefined();
      expect(result?.id).toBe(deployment.id);
      expect(result?.hub_status).toBe(DeploymentRequestHubStatus.Expired);
    });

    it('should not return deployment request when hub_status is Pending', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      const userId = ADMIN_UUID as UserId;

      await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Pending,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      await db<UserOrganization>('User_Organization').insert({
        user_id: userId,
        organization_id: PLATFORM_ORGANIZATION_UUID,
      } as UserOrganizationInitializer);

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeUndefined();
    });

    it('should not return deployment request when user is not member of the organization', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      const userId = ADMIN_UUID as UserId;
      const anotherUserId = SIMPLE_USER_FILIGRAN_ID as UserId;

      await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      // Insert User_Organization for another user
      await db<UserOrganization>('User_Organization').insert({
        user_id: anotherUserId,
        organization_id: PLATFORM_ORGANIZATION_UUID,
      } as UserOrganizationInitializer);

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeUndefined();
    });

    it('should not return deployment request when user is not in organization', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      const userId = SIMPLE_USER_FILIGRAN_ID as UserId;

      await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      // No User_Organization entry for this user

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeUndefined();
    });

    it('should not return deployment request when platform_identifier does not match', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      const userId = ADMIN_UUID as UserId;

      await insertOpenCtiDeploymentRequest({
        platform_identifier: PlatformIdentifier.Openaev,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      await db<UserOrganization>('User_Organization').insert({
        user_id: userId,
        organization_id: PLATFORM_ORGANIZATION_UUID,
      } as UserOrganizationInitializer);

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeUndefined();
    });
  });

  describe('loadProvisionedTrialDeploymentRequestByPlatformToken', () => {
    afterEach(async () => {
      await DeploymentRequestDomain.deleteDeploymentRequestBy({});
      await deleteServiceInstanceBy({});
      await deleteSubscriptionUnsecure({});
    });

    it('should return deployment request when Active trial deployment exists with matching token', async () => {
      const platformToken = uuidv4();

      const deployment = await insertOpenCtiDeploymentRequest({
        platform_token: platformToken,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
      });

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformToken(
          platformToken
        );

      expect(result).toBeDefined();
      expect(result?.id).toBe(deployment.id);
      expect(result?.platform_token).toBe(platformToken);
      expect(result?.hub_status).toBe(DeploymentRequestHubStatus.Active);
    });

    it('should return deployment request when Expired trial deployment exists with matching token', async () => {
      const platformToken = uuidv4();

      const deployment = await insertOpenCtiDeploymentRequest({
        platform_token: platformToken,
        hub_status: DeploymentRequestHubStatus.Expired,
        type: DeploymentRequestDeploymentType.Trial,
      });

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformToken(
          platformToken
        );

      expect(result).toBeDefined();
      expect(result?.id).toBe(deployment.id);
      expect(result?.hub_status).toBe(DeploymentRequestHubStatus.Expired);
    });

    it('should not return deployment request when hub_status is Pending', async () => {
      const platformToken = uuidv4();

      await insertOpenCtiDeploymentRequest({
        platform_token: platformToken,
        hub_status: DeploymentRequestHubStatus.Pending,
        type: DeploymentRequestDeploymentType.Trial,
      });

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformToken(
          platformToken
        );

      expect(result).toBeUndefined();
    });

    it('should return undefined when platform_token does not exist', async () => {
      const platformToken = uuidv4();
      const nonExistentToken = 'non-existent-token';

      await insertOpenCtiDeploymentRequest({
        platform_token: platformToken,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
      });

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformToken(
          nonExistentToken
        );

      expect(result).toBeUndefined();
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
      const resultDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: topDeploymentRequest!.id,
        });

      expect(resultDeploymentRequest).toBeDefined();
      expect(resultDeploymentRequest!.ordering).toBe(1);
    });

    it('should swap deployment request with the previous one', async () => {
      await insertOpenCtiDeploymentRequest({
        ordering: 2,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const previousDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const selectedDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestUp(
        selectedDeploymentRequest!
      );
      const resultPreviousDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: previousDeploymentRequest!.id,
        });
      const resultSelectedDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: selectedDeploymentRequest!.id,
        });
      expect(resultPreviousDeploymentRequest).toBeDefined();
      expect(resultPreviousDeploymentRequest!.ordering).toBe(4);

      expect(resultSelectedDeploymentRequest).toBeDefined();
      expect(resultSelectedDeploymentRequest!.ordering).toBe(3);
    });

    it('should only reorder queued deployment requests', async () => {
      const previousDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Active,
      });
      const selectedDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestUp(
        selectedDeploymentRequest!
      );
      const resultPreviousDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: previousDeploymentRequest!.id,
        });
      const resultSelectedDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: selectedDeploymentRequest!.id,
        });

      expect(resultPreviousDeploymentRequest).toBeDefined();
      expect(resultPreviousDeploymentRequest!.ordering).toBe(3);

      expect(resultSelectedDeploymentRequest).toBeDefined();
      expect(resultSelectedDeploymentRequest!.ordering).toBe(4);
    });
  });

  describe('reorderDeploymentRequestToTop', async () => {
    it('should do nothing when deployment request is the top one', async () => {
      const topDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 1,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 2,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestToTop(
        topDeploymentRequest!
      );
      const resultDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: topDeploymentRequest!.id,
        });

      expect(resultDeploymentRequest).toBeDefined();
      expect(resultDeploymentRequest!.ordering).toBe(1);
    });

    it('should reorder deployment request to top', async () => {
      const topDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 5,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const selectedDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 6,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestToTop(
        selectedDeploymentRequest!
      );
      const resultSelectedDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: selectedDeploymentRequest!.id,
        });

      const resultTopDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: topDeploymentRequest!.id,
        });

      expect(resultSelectedDeploymentRequest).toBeDefined();
      expect(resultSelectedDeploymentRequest!.ordering).toBe(1);

      expect(resultTopDeploymentRequest).toBeDefined();
      expect(resultTopDeploymentRequest!.ordering).toBe(4);
    });

    it('should only reorder queued deployment requests', async () => {
      const topDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const secondDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 4,
      });
      await insertOpenCtiDeploymentRequest({
        ordering: 5,
      });
      const selectedDeploymentRequest = await insertOpenCtiDeploymentRequest({
        ordering: 6,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      await DeploymentRequestDomain.reorderDeploymentRequestToTop(
        selectedDeploymentRequest!
      );
      const resultSelectedDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: selectedDeploymentRequest!.id,
        });

      const resultSecondDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: secondDeploymentRequest!.id,
        });

      const resultTopDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: topDeploymentRequest!.id,
        });

      expect(resultSelectedDeploymentRequest).toBeDefined();
      expect(resultSelectedDeploymentRequest!.ordering).toBe(1);

      expect(resultSecondDeploymentRequest).toBeDefined();
      expect(resultSecondDeploymentRequest!.ordering).toBe(
        secondDeploymentRequest!.ordering
      );

      expect(resultTopDeploymentRequest).toBeDefined();
      expect(resultTopDeploymentRequest!.ordering).toBe(4);
    });
  });
});
