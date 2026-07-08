import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  ManifestType,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { ManifestKey, ManifestRebuildQueueStatus } from './manifest.consts';
import { ManifestDomain } from './manifest.domain';

const MANIFEST_KEY: ManifestKey = {
  platformIdentifier: PlatformIdentifier.Opencti,
  version: '6.4.0',
  type: ManifestType.Connector,
};

describe('manifestDomain', () => {
  describe('loadPendingManifestsForProcessing', () => {
    afterEach(async () => {
      await TestHelper.manifestRebuildQueue.delete({});
    });

    it('should return an empty array when the queue is empty', async () => {
      const result = await ManifestDomain.loadPendingManifestsForProcessing();
      expect(result).toEqual([]);
    });

    it('should return all pending rows and flip their status to processing', async () => {
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Openaev,
        version: '1.0.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });

      const result = await ManifestDomain.loadPendingManifestsForProcessing();

      expect(result).toHaveLength(2);
      const rows = await TestHelper.manifestRebuildQueue.loadAll({});
      expect(
        rows.every((r) => r.status === ManifestRebuildQueueStatus.Processing)
      ).toBe(true);
    });

    it('should only pick up pending rows, leaving processing rows untouched', async () => {
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Openaev,
        version: '1.0.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Processing,
      });

      const result = await ManifestDomain.loadPendingManifestsForProcessing();

      expect(result).toHaveLength(1);
      expect(result[0]!.product).toBe(PlatformIdentifier.Opencti);
    });

    it('should only process rows matching the filter when one is provided', async () => {
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Openaev,
        version: '1.0.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });

      const result =
        await ManifestDomain.loadPendingManifestsForProcessing(MANIFEST_KEY);

      expect(result).toHaveLength(1);
      expect(result[0]!.product).toBe(PlatformIdentifier.Opencti);
      const untouched = await TestHelper.manifestRebuildQueue.load({
        product: PlatformIdentifier.Openaev,
      });
      expect(untouched!.status).toBe(ManifestRebuildQueueStatus.Pending);
    });
  });

  describe('insertIfNotPending', () => {
    afterEach(async () => {
      await TestHelper.manifestRebuildQueue.delete({});
    });

    describe('when the queue is empty', () => {
      it('should insert a row with status pending', async () => {
        await ManifestDomain.insertIfNotPending(MANIFEST_KEY);

        const rows = await TestHelper.manifestRebuildQueue.loadAll({});
        expect(rows).toHaveLength(1);
        expect(rows[0]!.status).toBe(ManifestRebuildQueueStatus.Pending);
      });

      it('should store the exact product, version and type provided', async () => {
        await ManifestDomain.insertIfNotPending(MANIFEST_KEY);

        const rows = await TestHelper.manifestRebuildQueue.loadAll({});
        expect(rows[0]).toMatchObject({
          product: PlatformIdentifier.Opencti,
          version: '6.4.0',
          type: ManifestType.Connector,
        });
      });

      it('should set created_at', async () => {
        await ManifestDomain.insertIfNotPending(MANIFEST_KEY);

        const rows = await TestHelper.manifestRebuildQueue.loadAll({});
        expect(rows[0]!.created_at).toBeInstanceOf(Date);
      });
    });

    describe('when a row with the same (product, version, type) already exists', () => {
      it.each`
        existingStatus                           | expectedCount | description
        ${ManifestRebuildQueueStatus.Pending}    | ${1}          | ${'does nothing — already queued'}
        ${ManifestRebuildQueueStatus.Processing} | ${2}          | ${'adds a new pending row — re-queued for after processing'}
      `(
        'when status is "$existingStatus": $description',
        async ({
          existingStatus,
          expectedCount,
        }: {
          existingStatus: ManifestRebuildQueueStatus;
          expectedCount: number;
        }) => {
          await TestHelper.manifestRebuildQueue.create({
            status: existingStatus,
          });

          await expect(
            ManifestDomain.insertIfNotPending(MANIFEST_KEY)
          ).resolves.not.toThrow();

          const rows = await TestHelper.manifestRebuildQueue.loadAll({});
          expect(rows).toHaveLength(expectedCount);
        }
      );
    });

    describe('when only part of the unique triple matches', () => {
      it.each`
        description            | platformIdentifier            | version    | type
        ${'different version'} | ${PlatformIdentifier.Opencti} | ${'7.0.0'} | ${ManifestType.Connector}
        ${'different product'} | ${PlatformIdentifier.Openaev} | ${'6.4.0'} | ${ManifestType.Connector}
      `(
        'should insert a new row when $description',
        async ({ platformIdentifier, version, type }: ManifestKey) => {
          await TestHelper.manifestRebuildQueue.create({});

          await ManifestDomain.insertIfNotPending({
            platformIdentifier,
            version,
            type,
          });

          const rows = await TestHelper.manifestRebuildQueue.loadAll({});
          expect(rows).toHaveLength(2);
        }
      );
    });
  });

  describe('recoverStuckProcessingEntries', () => {
    afterEach(async () => {
      await TestHelper.manifestRebuildQueue.delete({});
    });

    it('should return an empty array when the queue is empty', async () => {
      const result = await ManifestDomain.recoverStuckProcessingEntries();
      expect(result).toEqual([]);
    });

    it.each`
      description                  | status                                   | ageMinutes
      ${'a recent processing row'} | ${ManifestRebuildQueueStatus.Processing} | ${10}
      ${'an old pending row'}      | ${ManifestRebuildQueueStatus.Pending}    | ${40}
    `(
      'should do nothing and leave the status unchanged for $description',
      async ({
        status,
        ageMinutes,
      }: {
        status: ManifestRebuildQueueStatus;
        ageMinutes: number;
      }) => {
        await TestHelper.manifestRebuildQueue.create({
          product: PlatformIdentifier.Opencti,
          version: '6.4.0',
          type: ManifestType.Connector,
          status,
          created_at: new Date(Date.now() - ageMinutes * 60 * 1000),
        });

        const result = await ManifestDomain.recoverStuckProcessingEntries();

        expect(result).toEqual([]);
        const row = await TestHelper.manifestRebuildQueue.load({
          product: PlatformIdentifier.Opencti,
        });
        expect(row!.status).toBe(status);
      }
    );

    it('should reset a processing row older than 30 minutes back to pending and return it', async () => {
      const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Processing,
        created_at: fortyMinutesAgo,
      });

      const result = await ManifestDomain.recoverStuckProcessingEntries();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });
      const row = await TestHelper.manifestRebuildQueue.load({
        product: PlatformIdentifier.Opencti,
      });
      expect(row!.status).toBe(ManifestRebuildQueueStatus.Pending);
    });

    it('should reset only the old processing rows, leaving recent processing rows untouched', async () => {
      const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Processing,
        created_at: fortyMinutesAgo,
      });
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Openaev,
        version: '1.0.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Processing,
        created_at: new Date(),
      });

      const result = await ManifestDomain.recoverStuckProcessingEntries();

      expect(result).toHaveLength(1);
      expect(result[0]!.product).toBe(PlatformIdentifier.Opencti);
      const recentRow = await TestHelper.manifestRebuildQueue.load({
        product: PlatformIdentifier.Openaev,
      });
      expect(recentRow!.status).toBe(ManifestRebuildQueueStatus.Processing);
    });
  });
});
