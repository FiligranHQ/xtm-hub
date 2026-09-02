import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { UnauthenticatedError } from '@/lib/graphql-fetch.utils';
import { xtmPlatformTrialBundlePath } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import Page from '@app/(application)/app/(user)/service/xtm-platform-trial/page';
import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => Object.assign((key: string) => key, {}),
}));

const graphqlMocks = vi.hoisted(() => ({
  fetchActiveXtmPlatformBundle: vi.fn(),
  activeBundleFetcherFactory: vi.fn(),
}));

vi.mock('@/utils/settings.service', () => ({
  isFeatureEnabled: vi.fn(),
}));

vi.mock('@/lib/graphql-client', () => ({
  getAuthenticatedGraphqlClient: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useActiveXtmPlatformBundleQuery: {
      ...actual.useActiveXtmPlatformBundleQuery,
      fetcher: graphqlMocks.activeBundleFetcherFactory,
    },
  };
});

vi.mock(
  '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel',
  () => ({
    PrivateXtmPlatformTrialPanel: () => <div data-testid="private-panel" />,
  })
);

describe('private xtm-platform-trial page', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(isFeatureEnabled).mockReset();
    vi.mocked(redirect).mockReset();
    vi.mocked(notFound).mockClear();
    vi.mocked(getAuthenticatedGraphqlClient).mockReset();
    graphqlMocks.fetchActiveXtmPlatformBundle.mockReset();
    graphqlMocks.activeBundleFetcherFactory.mockReset();
    vi.mocked(getAuthenticatedGraphqlClient).mockResolvedValue(
      {} as Awaited<ReturnType<typeof getAuthenticatedGraphqlClient>>
    );
    graphqlMocks.activeBundleFetcherFactory.mockReturnValue(
      graphqlMocks.fetchActiveXtmPlatformBundle
    );
    graphqlMocks.fetchActiveXtmPlatformBundle.mockResolvedValue({
      activeXtmPlatformBundle: null,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders the breadcrumb and the private panel with limitations shown', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);

    const element = await Page();
    render(element);

    expect(screen.getByTestId('private-panel')).toBeInTheDocument();
    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Breadcrumb')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Limitations.Title')
    ).toBeInTheDocument();
  });

  it('redirects to the active bundle details page when one exists', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);
    graphqlMocks.fetchActiveXtmPlatformBundle.mockResolvedValue({
      activeXtmPlatformBundle: {
        service_instance_id: 'service-instance-1',
      },
    });

    await Page();

    expect(redirect).toHaveBeenCalledWith(
      xtmPlatformTrialBundlePath('service-instance-1')
    );
  });

  it('renders the page when active bundle lookup fails', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);
    graphqlMocks.fetchActiveXtmPlatformBundle.mockRejectedValue(
      new Error('network failure')
    );

    const element = await Page();
    render(element);

    expect(screen.getByTestId('private-panel')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('rethrows unauthenticated errors from active bundle lookup', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);
    graphqlMocks.fetchActiveXtmPlatformBundle.mockRejectedValue(
      new UnauthenticatedError()
    );

    await expect(Page()).rejects.toThrow('UNAUTHENTICATED');
  });

  it('calls notFound when the XtmPlatformTrial feature flag is disabled', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(false);

    await Page();

    expect(notFound).toHaveBeenCalled();
  });
});
