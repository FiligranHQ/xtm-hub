import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
} from '../../../../../../tests/tests.const';
import { IngestManifestApp } from './ingest-manifest.app';
import ingestManifestResolver from './ingest-manifest.resolver';

describe('query.updateOpenCTIManifest', () => {
  it('should call IngestManifestApp.updateOpenCTIManifest with tag and return success true', async () => {
    // Given
    const tag = '6.4.0';
    vi.spyOn(IngestManifestApp, 'updateOpenCTIManifest').mockResolvedValue({
      validContracts: [],
      errors: [],
    });

    // When
    const result = await ingestManifestResolver.Query!.updateOpenCTIManifest!(
      {},
      { tag },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(IngestManifestApp.updateOpenCTIManifest).toHaveBeenCalledWith(tag);
    expect(result).toMatchObject({ success: true });
  });

  it('should propagate error thrown by IngestManifestApp', async () => {
    // Given
    const tag = '6.4.0';
    vi.spyOn(IngestManifestApp, 'updateOpenCTIManifest').mockRejectedValue(
      new Error('MANIFEST_ERROR')
    );

    // When
    const call = ingestManifestResolver.Query!.updateOpenCTIManifest!(
      {},
      { tag },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toThrow('MANIFEST_ERROR');
  });
});
