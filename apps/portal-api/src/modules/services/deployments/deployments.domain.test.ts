import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  SIMPLE_USER_FILIGRAN_ID,
  THALES_SIMPLE_USER_ID,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestConnection,
  DeploymentRequestDeploymentType,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  DeploymentRequestOrdering,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  OrderingMode,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import { UserId } from '../../../model/kanel/public/User';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { deleteSubscriptionUnsecure } from '../../subcription/subscription.helper';
import { deleteServiceInstanceBy } from '../service-instance.domain';
import { DeploymentRequestDomain } from './deployments.domain';
import { insertOpenCtiDeploymentRequest } from './deployments.test.utils';

describe('DeploymentRequestDomain', () => {
  beforeEach(async () => {
    await db<DeploymentRequest>('DeploymentRequest').del();
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

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userId
        );

      expect(result).toBeUndefined();
    });

    it('should not return deployment request when user is not member of the organization', async () => {
      const platformIdentifier = PlatformIdentifier.Opencti;
      // THALES_SIMPLE_USER_ID is in Thales org, not in Filigran org (PLATFORM_ORGANIZATION_UUID)
      const userNotInOrganization = THALES_SIMPLE_USER_ID;

      await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Active,
        type: DeploymentRequestDeploymentType.Trial,
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
      });

      const result =
        await DeploymentRequestDomain.loadProvisionedTrialDeploymentRequestByPlatformIdentifier(
          platformIdentifier,
          userNotInOrganization
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

  describe('setPendingRequestsAsQueued', () => {
    let platformIdentifier: PlatformIdentifier;
    let region: DeploymentRequestPlatformRegion;
    let deploymentRequestId1: DeploymentRequestId;
    let deploymentRequestId2: DeploymentRequestId;
    let deploymentRequestId3: DeploymentRequestId;
    let deploymentRequestId4: DeploymentRequestId;
    beforeEach(async () => {
      const deploymentRequest1 = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });
      deploymentRequestId1 = deploymentRequest1!.id;
      platformIdentifier = deploymentRequest1!
        .platform_identifier as PlatformIdentifier;
      region = deploymentRequest1!.region as DeploymentRequestPlatformRegion;

      const deploymentRequest2 = await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });
      deploymentRequestId2 = deploymentRequest2!.id;

      const deploymentRequest3 = await insertOpenCtiDeploymentRequest({
        ordering: 5,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });
      deploymentRequestId3 = deploymentRequest3!.id;

      const deploymentRequest4 = await insertOpenCtiDeploymentRequest({
        ordering: 6,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });
      deploymentRequestId4 = deploymentRequest4!.id;
    });

    it('should update a limited number of requests when limit is specified', async () => {
      const updatedRequests =
        await DeploymentRequestDomain.setPendingRequestsAsQueued(
          platformIdentifier,
          region,
          1
        );

      expect(updatedRequests.length).toBe(1);
      expect(updatedRequests[0]!.id).toBe(deploymentRequestId2);

      await assertDeploymentRequestProperties(deploymentRequestId1, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });

      await assertDeploymentRequestProperties(deploymentRequestId2, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Removed,
      });

      await assertDeploymentRequestProperties(deploymentRequestId3, {
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });

      await assertDeploymentRequestProperties(deploymentRequestId4, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });
    });

    it('should update all requests when limit is not specified', async () => {
      const updatedRequests =
        await DeploymentRequestDomain.setPendingRequestsAsQueued(
          platformIdentifier,
          region
        );

      expect(updatedRequests.length).toBe(2);
      expect(updatedRequests[0]!.id).toBe(deploymentRequestId2);
      expect(updatedRequests[1]!.id).toBe(deploymentRequestId3);

      await assertDeploymentRequestProperties(deploymentRequestId1, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });

      await assertDeploymentRequestProperties(deploymentRequestId2, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Removed,
      });

      await assertDeploymentRequestProperties(deploymentRequestId3, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Removed,
      });

      await assertDeploymentRequestProperties(deploymentRequestId4, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });
    });

    it('should set pending requests in the right order with queued requests', async () => {
      await DeploymentRequestDomain.setPendingRequestsAsQueued(
        platformIdentifier,
        region
      );

      await assertDeploymentRequestProperties(deploymentRequestId1, {
        ordering: 5,
      });

      await assertDeploymentRequestProperties(deploymentRequestId2, {
        ordering: 1,
      });

      await assertDeploymentRequestProperties(deploymentRequestId3, {
        ordering: 2,
      });

      await assertDeploymentRequestProperties(deploymentRequestId4, {
        ordering: 8,
      });
    });

    it('should do nothing when there is no pending requests', async () => {
      await db<DeploymentRequest>('DeploymentRequest').update({
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      const updatedRequests =
        await DeploymentRequestDomain.setPendingRequestsAsQueued(
          platformIdentifier,
          region
        );

      expect(updatedRequests.length).toBe(0);

      await assertDeploymentRequestProperties(deploymentRequestId1, {
        ordering: 3,
      });

      await assertDeploymentRequestProperties(deploymentRequestId2, {
        ordering: 4,
      });

      await assertDeploymentRequestProperties(deploymentRequestId3, {
        ordering: 5,
      });

      await assertDeploymentRequestProperties(deploymentRequestId4, {
        ordering: 6,
      });
    });
  });

  describe('setQueuedRequestsAsPending', () => {
    it('should move a limited number of requests to pending, ordered by ordering', async () => {
      const deploymentRequest1 = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });
      const deploymentRequest2 = await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });
      const deploymentRequest3 = await insertOpenCtiDeploymentRequest({
        ordering: 5,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });
      const deploymentRequest4 = await insertOpenCtiDeploymentRequest({
        ordering: 6,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });

      const updatedDeploymentRequests =
        await DeploymentRequestDomain.setQueuedRequestsAsPending(
          deploymentRequest1!.platform_identifier as PlatformIdentifier,
          deploymentRequest1!.region as DeploymentRequestPlatformRegion,
          1
        );

      expect(updatedDeploymentRequests.length).toBe(1);
      expect(updatedDeploymentRequests[0]!.id).toBe(deploymentRequest1!.id);
      expect(updatedDeploymentRequests[0]!.hub_status).toBe(
        DeploymentRequestHubStatus.Pending
      );
      expect(updatedDeploymentRequests[0]!.target_state).toBe(
        DeploymentRequestHubStatus.Active
      );

      await assertDeploymentRequestProperties(deploymentRequest1!.id, {
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });

      await assertDeploymentRequestProperties(deploymentRequest2!.id, {
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });

      await assertDeploymentRequestProperties(deploymentRequest3!.id, {
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
      });

      await assertDeploymentRequestProperties(deploymentRequest4!.id, {
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
      });
    });

    it('should not move requests from another region', async () => {
      const deploymentRequest1 = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
        platform_identifier: PlatformIdentifier.Opencti,
      });
      const deploymentRequest2 = await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
        platform_identifier: PlatformIdentifier.Openaev,
      });

      const updatedDeploymentRequests =
        await DeploymentRequestDomain.setQueuedRequestsAsPending(
          PlatformIdentifier.Opencti,
          deploymentRequest1!.region as DeploymentRequestPlatformRegion,
          10
        );
      expect(updatedDeploymentRequests.length).toBe(1);
      await assertDeploymentRequestProperties(deploymentRequest1!.id, {
        hub_status: DeploymentRequestHubStatus.Pending,
      });
      await assertDeploymentRequestProperties(deploymentRequest2!.id, {
        hub_status: DeploymentRequestHubStatus.Queued,
      });
    });

    it('should not move request from another platform', async () => {
      const deploymentRequest1 = await insertOpenCtiDeploymentRequest({
        ordering: 3,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
        region: DeploymentRequestPlatformRegion.UsEast,
      });
      const deploymentRequest2 = await insertOpenCtiDeploymentRequest({
        ordering: 4,
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
        region: DeploymentRequestPlatformRegion.EuWest,
      });

      const updatedDeploymentRequests =
        await DeploymentRequestDomain.setQueuedRequestsAsPending(
          deploymentRequest1!.platform_identifier as PlatformIdentifier,
          DeploymentRequestPlatformRegion.UsEast,
          10
        );
      expect(updatedDeploymentRequests.length).toBe(1);
      await assertDeploymentRequestProperties(deploymentRequest1!.id, {
        hub_status: DeploymentRequestHubStatus.Pending,
      });
      await assertDeploymentRequestProperties(deploymentRequest2!.id, {
        hub_status: DeploymentRequestHubStatus.Queued,
      });
    });
  });

  const assertDeploymentRequestProperties = async (
    id: DeploymentRequestId,
    {
      hub_status,
      target_state,
      ordering,
    }: {
      hub_status?: DeploymentRequestHubStatus;
      target_state?: DeploymentRequestPlatformState;
      ordering?: number;
    }
  ) => {
    const deploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        id,
      });

    expect(deploymentRequest).toBeDefined();

    if (hub_status) {
      expect(deploymentRequest!.hub_status).toBe(hub_status);
    }

    if (target_state) {
      expect(deploymentRequest!.target_state).toBe(target_state);
    }

    if (ordering) {
      expect(deploymentRequest!.ordering).toBe(ordering);
    }
  };
});
