import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import { DeploymentQuotaApp } from './deployment.quota.app';

describe('deploymentQuotaApp', () => {
  const region = DeploymentRequestPlatformRegion.EuWest;
  const bundleFilter = {
    region,
    type: DeploymentRequestDeploymentType.Bundle,
  };
  const productFilter = (platformIdentifier: PlatformIdentifier) => ({
    region,
    platform_identifier: platformIdentifier,
  });

  const setQuota = async (
    filter: Record<string, unknown>,
    { capacity = 10, availability }: { capacity?: number; availability: number }
  ) => {
    await TestHelper.deploymentRequestQuota.update(filter, {
      capacity,
      availability,
    });
  };

  const loadAvailability = async (
    filter: Record<string, unknown>
  ): Promise<number> => {
    const quota = await TestHelper.deploymentRequestQuota.load(filter);
    return quota!.availability;
  };

  const createRequest = async (
    data: Partial<DeploymentRequest>
  ): Promise<DeploymentRequest> =>
    TestHelper.deploymentRequest.createWithServiceInstanceAndSubscription({
      region,
      ...data,
    });

  const createQueuedBundle = async (
    products: PlatformIdentifier[]
  ): Promise<DeploymentRequest> => {
    const bundle = await createRequest({
      type: DeploymentRequestDeploymentType.Bundle,
      platform_identifier: null,
      hub_status: DeploymentRequestHubStatus.Queued,
    });

    for (const platformIdentifier of products) {
      await createRequest({
        platform_identifier: platformIdentifier,
        hub_status: DeploymentRequestHubStatus.Queued,
        parent_id: bundle.id,
      });
    }

    return bundle;
  };

  beforeEach(async () => {
    await TestHelper.deploymentRequest.delete({});
    await setQuota(bundleFilter, { availability: 5 });
    await setQuota(productFilter(PlatformIdentifier.Opencti), {
      availability: 5,
    });
    await setQuota(productFilter(PlatformIdentifier.Openaev), {
      availability: 5,
    });
  });

  describe('takeQuotaForRequest', () => {
    it('should take the bundle place and one place per product', async () => {
      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        region,
        platformIdentifier: null,
        parentId: null,
        products: [PlatformIdentifier.Openaev, PlatformIdentifier.Opencti],
      });

      expect(result.isPlaceAvailable).toBe(true);
      expect(await loadAvailability(bundleFilter)).toBe(4);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(4);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Openaev))
      ).toBe(4);
    });

    it('should take no place at all when the bundle quota is exhausted', async () => {
      await setQuota(bundleFilter, { availability: 0 });

      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        region,
        platformIdentifier: null,
        parentId: null,
        products: [PlatformIdentifier.Opencti],
      });

      expect(result.isPlaceAvailable).toBe(false);
      expect(await loadAvailability(bundleFilter)).toBe(0);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(5);
    });

    it('should drive a product quota negative when the bundle place is available', async () => {
      await setQuota(productFilter(PlatformIdentifier.Opencti), {
        availability: 0,
      });

      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        region,
        platformIdentifier: null,
        parentId: null,
        products: [PlatformIdentifier.Opencti],
      });

      expect(result.isPlaceAvailable).toBe(true);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(-1);
    });

    it('should take a product place and a bundle place for a standalone trial', async () => {
      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Trial,
        region,
        platformIdentifier: PlatformIdentifier.Opencti,
        parentId: null,
      });

      expect(result.isPlaceAvailable).toBe(true);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(4);
      expect(await loadAvailability(bundleFilter)).toBe(4);
    });

    it('should take no place at all when the product quota is exhausted', async () => {
      await setQuota(productFilter(PlatformIdentifier.Opencti), {
        availability: 0,
      });

      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Trial,
        region,
        platformIdentifier: PlatformIdentifier.Opencti,
        parentId: null,
      });

      expect(result.isPlaceAvailable).toBe(false);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(0);
      expect(await loadAvailability(bundleFilter)).toBe(5);
    });

    it('should take no place for a bundle child, its place is taken by its bundle', async () => {
      const bundle = await createRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        platform_identifier: null,
        hub_status: DeploymentRequestHubStatus.Pending,
      });

      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Trial,
        region,
        platformIdentifier: PlatformIdentifier.Opencti,
        parentId: bundle.id as DeploymentRequestId,
      });

      expect(result.isPlaceAvailable).toBe(true);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(5);
      expect(await loadAvailability(bundleFilter)).toBe(5);
    });

    it('should always give a place for an unmanaged request', async () => {
      const result = await DeploymentQuotaApp.takeQuotaForRequest({
        type: DeploymentRequestDeploymentType.Trial,
        region,
        platformIdentifier: null,
        parentId: null,
      });

      expect(result.isPlaceAvailable).toBe(true);
      expect(await loadAvailability(bundleFilter)).toBe(5);
    });
  });

  describe('releaseQuotaForRequest', () => {
    it('should give the bundle place back when no bundle is queued', async () => {
      const bundle = await createRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        platform_identifier: null,
        hub_status: DeploymentRequestHubStatus.Cancelled,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        bundle,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted).toBeUndefined();
      expect(await loadAvailability(bundleFilter)).toBe(6);
    });

    it('should promote a queued bundle and take the places of its products', async () => {
      const queuedBundle = await createQueuedBundle([
        PlatformIdentifier.Opencti,
      ]);
      const bundle = await createRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        platform_identifier: null,
        hub_status: DeploymentRequestHubStatus.Cancelled,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        bundle,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted?.id).toBe(queuedBundle.id);
      expect(await loadAvailability(bundleFilter)).toBe(5);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(4);
    });

    it('should give the product place back when a bundle child is released and nothing is queued', async () => {
      const bundle = await createRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        platform_identifier: null,
        hub_status: DeploymentRequestHubStatus.Active,
      });
      const child = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Cancelled,
        parent_id: bundle.id,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        child,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted).toBeUndefined();
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(6);
      expect(await loadAvailability(bundleFilter)).toBe(5);
    });

    it('should promote a queued trial and take a bundle place when a bundle child is released', async () => {
      const bundle = await createRequest({
        type: DeploymentRequestDeploymentType.Bundle,
        platform_identifier: null,
        hub_status: DeploymentRequestHubStatus.Active,
      });
      const child = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Cancelled,
        parent_id: bundle.id,
      });
      const queuedTrial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        child,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted?.id).toBe(queuedTrial.id);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(5);
      expect(await loadAvailability(bundleFilter)).toBe(4);
    });

    it('should give both places back when a standalone trial is released and nothing is queued', async () => {
      const trial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Cancelled,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        trial,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted).toBeUndefined();
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(6);
      expect(await loadAvailability(bundleFilter)).toBe(6);
    });

    it('should promote a queued bundle in priority when a standalone trial is released', async () => {
      const queuedBundle = await createQueuedBundle([
        PlatformIdentifier.Openaev,
      ]);
      await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const trial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Cancelled,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        trial,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted?.id).toBe(queuedBundle.id);
      expect(await loadAvailability(bundleFilter)).toBe(5);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(6);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Openaev))
      ).toBe(4);
    });

    it('should promote a queued trial when no bundle is queued', async () => {
      const queuedTrial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const trial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Cancelled,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        trial,
        DeploymentRequestHubStatus.Active
      );

      expect(promoted?.id).toBe(queuedTrial.id);
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(5);
      expect(await loadAvailability(bundleFilter)).toBe(5);
    });

    it('should give the places back without promoting anyone when promotion is disabled', async () => {
      const queuedTrial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Queued,
      });
      const trial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      const promoted = await DeploymentQuotaApp.releaseQuotaForRequest(
        trial,
        DeploymentRequestHubStatus.Pending,
        { promote: false }
      );

      expect(promoted).toBeUndefined();
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(6);
      expect(await loadAvailability(bundleFilter)).toBe(6);
      await TestHelper.deploymentRequest.assertProperties(
        queuedTrial.id as DeploymentRequestId,
        { hub_status: DeploymentRequestHubStatus.Queued }
      );
    });
  });

  describe('applyQuotaCapacityChange', () => {
    const applyCapacity = async (newCapacity: number) => {
      const onRequestMoved = vi.fn().mockResolvedValue(undefined);

      await DeploymentQuotaApp.applyQuotaCapacityChange({
        platformIdentifier: PlatformIdentifier.Opencti,
        region,
        newCapacity,
        onRequestMoved,
      });

      return onRequestMoved;
    };

    it('should promote a queued trial and take its product and bundle places', async () => {
      await setQuota(productFilter(PlatformIdentifier.Opencti), {
        capacity: 5,
        availability: 0,
      });
      const queuedTrial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Queued,
      });

      const onRequestMoved = await applyCapacity(6);

      await TestHelper.deploymentRequest.assertProperties(
        queuedTrial.id as DeploymentRequestId,
        { hub_status: DeploymentRequestHubStatus.Pending }
      );
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(0);
      expect(await loadAvailability(bundleFilter)).toBe(4);
      expect(onRequestMoved).toHaveBeenCalledTimes(1);
      expect(onRequestMoved.mock.calls[0][0].id).toBe(queuedTrial.id);
    });

    it('should not promote a queued bundle', async () => {
      await setQuota(productFilter(PlatformIdentifier.Opencti), {
        capacity: 5,
        availability: 0,
      });
      const queuedBundle = await createQueuedBundle([
        PlatformIdentifier.Opencti,
      ]);

      const onRequestMoved = await applyCapacity(6);

      await TestHelper.deploymentRequest.assertProperties(
        queuedBundle.id as DeploymentRequestId,
        { hub_status: DeploymentRequestHubStatus.Queued }
      );
      expect(await loadAvailability(bundleFilter)).toBe(5);
      expect(onRequestMoved).not.toHaveBeenCalled();
    });

    it('should not promote anything when the queue is empty', async () => {
      await setQuota(productFilter(PlatformIdentifier.Opencti), {
        capacity: 1,
        availability: 1,
      });

      const onRequestMoved = await applyCapacity(3);

      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(3);
      expect(await loadAvailability(bundleFilter)).toBe(5);
      expect(onRequestMoved).not.toHaveBeenCalled();
    });

    it('should give the product and the bundle places back when a pending trial is queued', async () => {
      await setQuota(productFilter(PlatformIdentifier.Opencti), {
        capacity: 1,
        availability: 0,
      });
      await setQuota(bundleFilter, { capacity: 5, availability: 4 });
      const pendingTrial = await createRequest({
        platform_identifier: PlatformIdentifier.Opencti,
        hub_status: DeploymentRequestHubStatus.Pending,
      });

      const onRequestMoved = await applyCapacity(0);

      await TestHelper.deploymentRequest.assertProperties(
        pendingTrial.id as DeploymentRequestId,
        { hub_status: DeploymentRequestHubStatus.Queued }
      );
      expect(
        await loadAvailability(productFilter(PlatformIdentifier.Opencti))
      ).toBe(0);
      expect(await loadAvailability(bundleFilter)).toBe(5);
      expect(onRequestMoved).toHaveBeenCalledTimes(1);
    });
  });
});
