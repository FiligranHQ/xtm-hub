import { PrivateXtmPlatformTrialBanner } from '@/components/service/trial-instances/banner/xtm-platform-trial/PrivateXtmPlatformTrialBanner';
import testRender from '@/utils/test/test-render';
import {
  DeploymentRequestHubStatus,
  PlatformTrialStatusQueryVariables,
} from '@graphql/generated';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const graphqlMocks = vi.hoisted(() => ({
  usePlatformTrialStatusQuery: Object.assign(vi.fn(), {
    getKey: vi.fn((variables: PlatformTrialStatusQueryVariables) => [
      'PlatformTrialStatus',
      variables,
    ]),
    getRootKey: vi.fn(() => ['PlatformTrialStatus']),
  }),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();

  return {
    ...actual,
    usePlatformTrialStatusQuery: graphqlMocks.usePlatformTrialStatusQuery,
  };
});

vi.mock('@/lib/graphql-client', () => ({
  portalGraphqlClient: { _mock: 'portalGraphqlClient' },
}));

describe('PrivateXtmPlatformTrialBanner', () => {
  beforeEach(() => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReset();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should render nothing while the query is loading', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isPending: true,
    });

    const { container } = testRender(<PrivateXtmPlatformTrialBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the active banner derived from the query result', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: {
        platformTrialStatus: {
          isBlacklisted: false,
          hub_status: DeploymentRequestHubStatus.Active,
          end_date: new Date(
            Date.now() + 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
      isLoading: false,
      isPending: false,
    });

    const { getByText } = testRender(<PrivateXtmPlatformTrialBanner />);

    expect(
      getByText('Service.Trials.XtmPlatform.Active.Text')
    ).toBeInTheDocument();
  });

  it('should render nothing when the organization is blacklisted', () => {
    graphqlMocks.usePlatformTrialStatusQuery.mockReturnValue({
      data: {
        platformTrialStatus: {
          isBlacklisted: true,
          hub_status: DeploymentRequestHubStatus.Active,
          end_date: new Date(
            Date.now() + 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
      isLoading: false,
      isPending: false,
    });

    const { container } = testRender(<PrivateXtmPlatformTrialBanner />);

    expect(container).toBeEmptyDOMElement();
  });
});
