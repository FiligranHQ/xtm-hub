import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  loadManifestsMock,
  getManifestByNameMock,
  downloadFileMock,
  validateVersionMock,
} = vi.hoisted(() => ({
  loadManifestsMock: vi.fn(),
  getManifestByNameMock: vi.fn(),
  downloadFileMock: vi.fn(),
  validateVersionMock: vi.fn(),
}));

vi.mock('../../modules/shareable-resource/manifest/manifest.domain', () => ({
  ManifestDomain: {
    getManifestByName: getManifestByNameMock,
    loadManifests: loadManifestsMock,
  },
}));
vi.mock('../../thirdparty/minio/client', () => ({
  MinIOClient: { downloadFile: downloadFileMock },
}));
vi.mock('../../modules/shareable-resource/manifest/manifest.helper', () => ({
  ManifestHelper: {
    buildManifestObjectKey: (p: string, v: string, n: string) =>
      `${p}/${v}/connector/manifest/${n}.json`,
  },
}));
vi.mock(
  '../../modules/shareable-resource/manifest-fragment/manifest-fragment.helper',
  () => ({
    ManifestFragmentHelper: {
      validateAndFormatManifestVersion: validateVersionMock,
    },
  })
);
vi.mock('../../utils/app-logger.util', () => ({
  logApp: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { ManifestEndpoint } from './manifest-endpoint';

const buildResponse = () => ({
  headersSent: false,
  setHeader: vi.fn(),
  removeHeader: vi.fn(),
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

const buildRequest = (
  params: Record<string, string>,
  query: Record<string, unknown> = {}
) => ({ params, query }) as unknown as Request;

const VALID = {
  product: 'opencti',
  version: '7.260604.0',
  integrationType: 'connector',
};
const VALID_NAME = 'connector-manifest-7.260604.0-260526113805';

describe('downloadLatestManifest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateVersionMock.mockReturnValue('padded');
  });

  it('streams the latest manifest with a no-cache header', async () => {
    loadManifestsMock.mockResolvedValue([
      { name: VALID_NAME, created_at: new Date() },
    ]);
    const pipe = vi.fn();
    downloadFileMock.mockResolvedValue({ on: vi.fn(), pipe });

    const res = buildResponse();
    await ManifestEndpoint.downloadLatestManifest(
      buildRequest(VALID),
      res as unknown as Response
    );

    expect(downloadFileMock).toHaveBeenCalledWith(
      `opencti/7.260604.0/connector/manifest/${VALID_NAME}.json`
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(pipe).toHaveBeenCalledWith(res);
  });

  it('returns 404 when no manifest exists', async () => {
    loadManifestsMock.mockResolvedValue([]);

    const res = buildResponse();
    await ManifestEndpoint.downloadLatestManifest(
      buildRequest(VALID),
      res as unknown as Response
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(downloadFileMock).not.toHaveBeenCalled();
  });

  it('returns 400 on an invalid product', async () => {
    const res = buildResponse();
    await ManifestEndpoint.downloadLatestManifest(
      buildRequest({ ...VALID, product: 'nope' }),
      res as unknown as Response
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(loadManifestsMock).not.toHaveBeenCalled();
  });
});

describe('downloadManifestByName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateVersionMock.mockReturnValue('padded');
  });

  it('rejects a path-traversal name with 400 before any lookup', async () => {
    const res = buildResponse();
    await ManifestEndpoint.downloadManifestByName(
      buildRequest({ ...VALID, name: '../../secret' }),
      res as unknown as Response
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getManifestByNameMock).not.toHaveBeenCalled();
    expect(downloadFileMock).not.toHaveBeenCalled();
  });

  it('streams a known manifest with an immutable cache header', async () => {
    getManifestByNameMock.mockResolvedValue({
      name: VALID_NAME,
      created_at: new Date(),
    });
    const pipe = vi.fn();
    downloadFileMock.mockResolvedValue({ on: vi.fn(), pipe });

    const res = buildResponse();
    await ManifestEndpoint.downloadManifestByName(
      buildRequest({ ...VALID, name: VALID_NAME }),
      res as unknown as Response
    );

    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    expect(pipe).toHaveBeenCalledWith(res);
  });
});

describe('listManifests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateVersionMock.mockReturnValue('padded');
  });

  it('returns 200 with the manifests from the domain', async () => {
    const rows = [
      {
        name: 'connector-manifest-7.260604.0-260526113805',
        created_at: new Date(),
      },
    ];
    loadManifestsMock.mockResolvedValue(rows);

    const res = buildResponse();
    await ManifestEndpoint.listManifests(
      buildRequest(VALID),
      res as unknown as Response
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ manifests: rows });
  });

  it('caps count and forwards it to the domain', async () => {
    loadManifestsMock.mockResolvedValue([]);

    const res = buildResponse();
    await ManifestEndpoint.listManifests(
      buildRequest(VALID, { count: '5' }),
      res as unknown as Response
    );

    expect(loadManifestsMock).toHaveBeenCalledWith(
      'opencti',
      '7.260604.0',
      'connector',
      5
    );
  });

  it.each`
    params                                | query             | description
    ${{ ...VALID, product: 'x' }}         | ${{}}             | ${'invalid product'}
    ${{ ...VALID, integrationType: 'x' }} | ${{}}             | ${'invalid integrationType'}
    ${VALID}                              | ${{ count: '0' }} | ${'invalid count'}
  `('returns 400 on $description', async ({ params, query }) => {
    const res = buildResponse();
    await ManifestEndpoint.listManifests(
      buildRequest(params, query),
      res as unknown as Response
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(loadManifestsMock).not.toHaveBeenCalled();
  });
});
