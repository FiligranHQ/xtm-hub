import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { loadMeUser } from '@/utils/load-me-user';
import {
  DeploymentRequestSource,
  OrganizationCapability,
  PlatformIdentifier,
  PortalCapability,
} from '@graphql/generated';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirectToCreateFreeTrial } from './create-free-trial';
import { loadBaseUrlFront } from './utils/load';

vi.mock('./utils/load');
vi.mock('../../../src/utils/load-me-user');
vi.mock('../../../src/relay/server-portal-api-fetch', () => ({
  serverFetchGraphQL: vi.fn(),
}));

const BASE_URL = 'http://localhost:3002';
const REQUEST_URL = `/redirect/create-free-trial`;
const EXPECTED_LOGIN_REDIRECT_URL = `${BASE_URL}/login?redirect=${btoa(REQUEST_URL)}`;

const OPENCTI_FREE_TRIAL_URL = `${BASE_URL}/app/service/opencti-free-trial?source=${DeploymentRequestSource.OpenctiDemo}`;
const OPENAEV_FREE_TRIAL_URL = `${BASE_URL}/app/service/openaev-free-trial?source=${DeploymentRequestSource.OpenaevDemo}`;

const makeRequest = () => new NextRequest(`${BASE_URL}${REQUEST_URL}`);

type LoadMeUserResult = Awaited<ReturnType<typeof loadMeUser>>;

const baseUser: LoadMeUserResult = {
  id: 'user-1',
  selected_organization_id: 'org-1',
  organizations: [],
  capabilities: [],
  selected_org_capabilities: [OrganizationCapability.AdministrateOrganization],
};

const defaultTrialDeployments = {
  availableTrials: [PlatformIdentifier.Opencti],
  deployed: [],
  isBlacklisted: false,
};

describe('redirectToCreateFreeTrial', () => {
  beforeEach(() => {
    vi.mocked(loadBaseUrlFront).mockResolvedValue(BASE_URL);
    vi.mocked(loadMeUser).mockResolvedValue(baseUser);
    vi.mocked(serverFetchGraphQL).mockResolvedValue({
      data: { trialDeployments: defaultTrialDeployments },
    });
  });

  describe('unauthenticated', () => {
    it('redirects to login with redirect param when user is null', async () => {
      vi.mocked(loadMeUser).mockResolvedValue(null);

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(
        EXPECTED_LOGIN_REDIRECT_URL
      );
    });

    it('redirects to login with redirect param when UNAUTHENTICATED error is thrown', async () => {
      vi.mocked(loadMeUser).mockRejectedValue(new Error('UNAUTHENTICATED'));

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(
        EXPECTED_LOGIN_REDIRECT_URL
      );
    });

    it('redirects to /login without redirect param when a generic error is thrown', async () => {
      vi.mocked(loadMeUser).mockRejectedValue(
        new Error('Something went wrong')
      );

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(`${BASE_URL}/login`);
    });
  });

  describe('unauthorized', () => {
    it('redirects to freeTrialUrl without openForm when user has no required capabilities and is not admin', async () => {
      vi.mocked(loadMeUser).mockResolvedValue({
        ...baseUser,
        capabilities: [],
        selected_org_capabilities: [],
      });

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(OPENCTI_FREE_TRIAL_URL);
      expect(serverFetchGraphQL).not.toHaveBeenCalled();
    });
  });

  describe('authorized', () => {
    it('admin (BYPASS) bypasses capability check and reaches GraphQL', async () => {
      vi.mocked(loadMeUser).mockResolvedValue({
        ...baseUser,
        capabilities: [{ name: PortalCapability.Bypass }],
        selected_org_capabilities: [],
      });

      await redirectToCreateFreeTrial(makeRequest());

      expect(serverFetchGraphQL).toHaveBeenCalled();
    });

    it('redirects to existing trial instance when a deployed trial exists', async () => {
      vi.mocked(serverFetchGraphQL).mockResolvedValue({
        data: {
          trialDeployments: {
            ...defaultTrialDeployments,
            deployed: [{ serviceInstanceId: 'instance-abc' }],
          },
        },
      });

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(
        `${BASE_URL}/app/service/opencti_registration/instance-abc`
      );
    });

    it('redirects with openForm=true when available trials exist and not blacklisted', async () => {
      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(
        `${OPENCTI_FREE_TRIAL_URL}&openForm=true`
      );
    });

    it('redirects to freeTrialUrl without openForm when no available trials', async () => {
      vi.mocked(serverFetchGraphQL).mockResolvedValue({
        data: {
          trialDeployments: {
            availableTrials: [],
            deployed: [],
            isBlacklisted: false,
          },
        },
      });

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(OPENCTI_FREE_TRIAL_URL);
    });

    it('redirects to freeTrialUrl without openForm when user is blacklisted', async () => {
      vi.mocked(serverFetchGraphQL).mockResolvedValue({
        data: {
          trialDeployments: {
            availableTrials: [PlatformIdentifier.Opencti],
            deployed: [],
            isBlacklisted: true,
          },
        },
      });

      const response = await redirectToCreateFreeTrial(makeRequest());

      expect(response.headers.get('location')).toBe(OPENCTI_FREE_TRIAL_URL);
    });
  });

  describe('with PlatformIdentifier.Openaev', () => {
    it('uses openaev path and source when user is not allowed', async () => {
      vi.mocked(loadMeUser).mockResolvedValue({
        ...baseUser,
        capabilities: [],
        selected_org_capabilities: [],
      });

      const response = await redirectToCreateFreeTrial(
        makeRequest(),
        PlatformIdentifier.Openaev
      );

      expect(response.headers.get('location')).toBe(OPENAEV_FREE_TRIAL_URL);
    });

    it('redirects to openaev instance when a deployed openaev trial exists', async () => {
      vi.mocked(serverFetchGraphQL).mockResolvedValue({
        data: {
          trialDeployments: {
            ...defaultTrialDeployments,
            deployed: [{ serviceInstanceId: 'openaev-instance-xyz' }],
          },
        },
      });

      const response = await redirectToCreateFreeTrial(
        makeRequest(),
        PlatformIdentifier.Openaev
      );

      expect(response.headers.get('location')).toBe(
        `${BASE_URL}/app/service/openaev_registration/openaev-instance-xyz`
      );
    });
  });
});
