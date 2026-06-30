import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import { ManifestType } from '../../../__generated__/resolvers-types';
import { ManifestRebuildQueueStatus } from './manifest.consts';
import { ManifestDomain } from './manifest.domain';

describe('manifestDomain.insertIfNotPending', () => {
  afterEach(async () => {
    await TestHelper.manifestRebuildQueue.delete({});
  });

  describe('when the queue is empty', () => {
    it('should insert a row with status pending', async () => {
      await ManifestDomain.insertIfNotPending(
        'opencti',
        '6.4.0',
        ManifestType.Connector
      );

      const rows = await TestHelper.manifestRebuildQueue.loadAll({});
      expect(rows).toHaveLength(1);
      expect(rows[0]!.status).toBe(ManifestRebuildQueueStatus.Pending);
    });

    it('should store the exact product, version and type provided', async () => {
      await ManifestDomain.insertIfNotPending(
        'opencti',
        '6.4.0',
        ManifestType.Connector
      );

      const rows = await TestHelper.manifestRebuildQueue.loadAll({});
      expect(rows[0]).toMatchObject({
        product: 'opencti',
        version: '6.4.0',
        type: ManifestType.Connector,
      });
    });

    it('should set created_at', async () => {
      await ManifestDomain.insertIfNotPending(
        'opencti',
        '6.4.0',
        ManifestType.Connector
      );

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
          ManifestDomain.insertIfNotPending(
            'opencti',
            '6.4.0',
            ManifestType.Connector
          )
        ).resolves.not.toThrow();

        const rows = await TestHelper.manifestRebuildQueue.loadAll({});
        expect(rows).toHaveLength(expectedCount);
      }
    );
  });

  describe('when only part of the unique triple matches', () => {
    it.each`
      description            | product      | version    | type
      ${'different version'} | ${'opencti'} | ${'7.0.0'} | ${ManifestType.Connector}
      ${'different product'} | ${'openbas'} | ${'6.4.0'} | ${ManifestType.Connector}
    `(
      'should insert a new row when $description',
      async ({
        product,
        version,
        type,
      }: {
        product: string;
        version: string;
        type: ManifestType;
      }) => {
        await TestHelper.manifestRebuildQueue.create({});

        await ManifestDomain.insertIfNotPending(product, version, type);

        const rows = await TestHelper.manifestRebuildQueue.loadAll({});
        expect(rows).toHaveLength(2);
      }
    );
  });
});
