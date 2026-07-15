import type { PgBoss } from 'pg-boss';
import { describe, expect, it, vi } from 'vitest';
import {
  ManifestType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { ManifestApp } from '../../modules/shareable-resource/manifest/manifest.app';
import { SYSTEM_USER_CONTEXT } from '../../portal.const';
import { ManifestWorkers } from './manifest.workers';

describe('manifestWorkers – request context', () => {
  it('sets the system user context before processing a job, so requireUser() does not throw NO_ASYNC_CONTEXT_AVAILABLE', async () => {
    const work = vi.fn();
    const boss = {
      createQueue: vi.fn(),
      work,
    } as unknown as PgBoss;

    await ManifestWorkers.start(boss);

    const handler = work.mock.calls[0][2] as (
      jobs: { id: string; data: unknown }[]
    ) => Promise<void>;

    const runSpy = vi.spyOn(requestContext, 'run');
    const processManifestQueueSpy = vi
      .spyOn(ManifestApp, 'processManifestQueue')
      .mockImplementation(async () => {
        // Simulates code reached inside the job that relies on requestContext.requireUser()
        requestContext.requireUser();
      });

    const jobData = {
      platformIdentifier: PlatformIdentifier.Opencti,
      version: '7.260309.0',
      type: ManifestType.Connector,
    };

    await expect(
      handler([{ id: 'job-1', data: jobData }])
    ).resolves.not.toThrow();

    expect(runSpy).toHaveBeenCalledWith(
      SYSTEM_USER_CONTEXT,
      expect.any(Function)
    );
    expect(processManifestQueueSpy).toHaveBeenCalledWith(jobData);

    runSpy.mockRestore();
    processManifestQueueSpy.mockRestore();
  });
});
