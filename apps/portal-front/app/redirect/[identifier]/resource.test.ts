import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { serverMutateGraphQL } from '../../../src/relay/server-portal-api-fetch';
import { redirectToResource } from './resource';
import {
  loadBaseUrlFront,
  loadMeUser,
  loadPlatformOrganizationId,
  loadServiceInstances,
} from './utils/load';

vi.mock('../../../src/relay/server-portal-api-fetch', () => ({
  serverMutateGraphQL: vi.fn(),
}));
vi.mock('./utils/load');

const BASE_URL = 'http://localhost:3002';
const IDENTIFIER = ServiceDefinitionIdentifierEnum.OPENAEV_SCENARIOS;

type LoadServiceInstancesResult = Awaited<
  ReturnType<typeof loadServiceInstances>
>;
type LoadMeUserResult = Awaited<ReturnType<typeof loadMeUser>>;

const makeRequest = (pathAndQuery = `/redirect/${IDENTIFIER}`) =>
  new NextRequest(`${BASE_URL}${pathAndQuery}`);

const defaultUser: LoadMeUserResult = {
  id: 'user-1',
  selected_organization_id: 'organization-id',
  organizations: [],
  capabilities: [],
  selected_org_capabilities: [],
};

describe('redirectToResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadBaseUrlFront).mockResolvedValue(BASE_URL);
    vi.mocked(loadMeUser).mockResolvedValue(defaultUser);
    vi.mocked(loadPlatformOrganizationId).mockResolvedValue(undefined);
    vi.mocked(loadServiceInstances).mockResolvedValue(
      [] as LoadServiceInstancesResult
    );
  });

  it('redirects to login when the user is not authenticated', async () => {
    // Given
    const pathAndQuery = `/redirect/${IDENTIFIER}?platform_id=platform-1&tenant_id=tenant-1`;
    const expectedLocation = `${BASE_URL}/login?redirect=${btoa(pathAndQuery)}`;
    vi.mocked(loadMeUser).mockResolvedValue(
      null as unknown as LoadMeUserResult
    );

    // When
    const response = await redirectToResource(
      { identifier: IDENTIFIER },
      makeRequest(pathAndQuery)
    );

    // Then
    expect(response.headers.get('location')).toBe(expectedLocation);
    expect(loadPlatformOrganizationId).not.toHaveBeenCalled();
    expect(serverMutateGraphQL).not.toHaveBeenCalled();
    expect(loadServiceInstances).not.toHaveBeenCalled();
  });

  it.each`
    pathAndQuery                                                            | expectedPlatformId | expectedTenantId | description
    ${`/redirect/${IDENTIFIER}?opencti_platform_id=opencti-1`}              | ${'opencti-1'}     | ${null}          | ${'uses opencti_platform_id without tenant_id'}
    ${`/redirect/${IDENTIFIER}?oaev_instance_id=oaev-1&tenant_id=tenant-1`} | ${'oaev-1'}        | ${'tenant-1'}    | ${'uses oaev_instance_id with tenant_id'}
    ${`/redirect/${IDENTIFIER}?oaev_instance_id=oaev-2`}                    | ${'oaev-2'}        | ${null}          | ${'uses oaev_instance_id without tenant_id'}
    ${`/redirect/${IDENTIFIER}?platform_id=platform-1`}                     | ${'platform-1'}    | ${null}          | ${'uses platform_id without tenant_id'}
  `(
    'loads platform organization from supported query params ($description)',
    async ({ pathAndQuery, expectedPlatformId, expectedTenantId }) => {
      // Given
      vi.mocked(loadPlatformOrganizationId).mockResolvedValue(
        'organization-from-platform'
      );

      // When
      await redirectToResource(
        { identifier: IDENTIFIER },
        makeRequest(pathAndQuery)
      );

      // Then
      expect(loadPlatformOrganizationId).toHaveBeenCalledOnce();
      expect(loadPlatformOrganizationId).toHaveBeenCalledWith(
        expectedPlatformId,
        expectedTenantId
      );
      expect(serverMutateGraphQL).toHaveBeenCalledWith(expect.anything(), {
        organization_id: 'organization-from-platform',
      });
    }
  );

  it('uses selected_organization_id when no platform organization is found', async () => {
    // Given
    vi.mocked(loadPlatformOrganizationId).mockResolvedValue(undefined);

    // When
    await redirectToResource(
      { identifier: IDENTIFIER },
      makeRequest(
        `/redirect/${IDENTIFIER}?platform_id=platform-1&tenant_id=tenant-1`
      )
    );

    // Then
    expect(serverMutateGraphQL).toHaveBeenCalledWith(expect.anything(), {
      organization_id: defaultUser.selected_organization_id,
    });
  });

  it('returns 400 for an invalid identifier', async () => {
    // Given
    const invalidIdentifier = 'invalid-identifier';
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    // When
    const response = await redirectToResource(
      { identifier: invalidIdentifier },
      makeRequest(
        `/redirect/${IDENTIFIER}?platform_id=platform-1&tenant_id=tenant-1`
      )
    );

    // Then
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid identifier');
    expect(serverMutateGraphQL).toHaveBeenCalledOnce();
    expect(loadServiceInstances).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  const redirectDestinationCases = [
    {
      description: 'to /app when no instance exists',
      serviceInstances: [],
      expectedLocation: `${BASE_URL}/app`,
    },
    {
      description: 'to the instance',
      serviceInstances: [
        {
          id: 'instance-target',
          service_definition: {
            identifier: ServiceDefinitionIdentifierEnum.OPENAEV_SCENARIOS,
          },
        },
      ],
      expectedLocation: `${BASE_URL}/app/service/${ServiceDefinitionIdentifierEnum.OPENAEV_SCENARIOS}/instance-target`,
    },
  ];

  it.each(redirectDestinationCases)(
    'redirects to the correct destination ($description)',
    async ({ serviceInstances, expectedLocation }) => {
      // Given
      vi.mocked(loadServiceInstances).mockResolvedValue(
        serviceInstances as LoadServiceInstancesResult
      );

      // When
      const response = await redirectToResource(
        { identifier: IDENTIFIER },
        makeRequest()
      );

      // Then
      expect(loadServiceInstances).toHaveBeenCalledWith(IDENTIFIER);
      expect(response.headers.get('location')).toBe(expectedLocation);
    }
  );
});
