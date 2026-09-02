import { isFeatureEnabled } from '@/utils/settings.service';
import Page from '@app/(application)/app/(user)/service/xtm-platform-trial/page';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/settings.service', () => ({
  isFeatureEnabled: vi.fn(),
}));

vi.mock(
  '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel',
  () => ({
    PrivateXtmPlatformTrialPanel: () => <div data-testid="private-panel" />,
  })
);

vi.mock('@/components/xtm-platform-trial/XtmPlatformTrialPage', () => ({
  XtmPlatformTrialPage: ({
    serviceInstanceId,
  }: {
    serviceInstanceId: string;
  }) => <div data-testid="bundle-dashboard">{serviceInstanceId}</div>,
}));

const mockUseActiveXtmPlatformBundleQuery = vi.fn();
vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useActiveXtmPlatformBundleQuery: (
    ...args: Parameters<typeof mockUseActiveXtmPlatformBundleQuery>
  ) => mockUseActiveXtmPlatformBundleQuery(...args),
}));

vi.mock('@graphql/deployment/deployment.keys', () => ({
  xtmPlatformBundleKeys: {
    activeXtmPlatformBundle: () => ['ActiveXtmPlatformBundle'],
  },
}));

describe('private xtm-platform-trial page', () => {
  beforeEach(() => {
    vi.mocked(isFeatureEnabled).mockReset();
    vi.mocked(notFound).mockClear();
    mockUseActiveXtmPlatformBundleQuery.mockReset();
  });

  it('renders the breadcrumb and the private panel with limitations shown when there is no active bundle', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);
    mockUseActiveXtmPlatformBundleQuery.mockReturnValue({
      data: { activeXtmPlatformBundle: null },
      isLoading: false,
    });

    const element = await Page();
    render(element);

    expect(screen.getByTestId('private-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('bundle-dashboard')).not.toBeInTheDocument();
    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Breadcrumb')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Limitations.Title')
    ).toBeInTheDocument();
  });

  it('renders the bundle dashboard instead of the private panel when an active bundle exists', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);
    mockUseActiveXtmPlatformBundleQuery.mockReturnValue({
      data: {
        activeXtmPlatformBundle: { service_instance_id: 'bundle-instance-id' },
      },
      isLoading: false,
    });

    const element = await Page();
    render(element);

    expect(screen.getByTestId('bundle-dashboard')).toHaveTextContent(
      'bundle-instance-id'
    );
    expect(screen.queryByTestId('private-panel')).not.toBeInTheDocument();
    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Breadcrumb')
    ).toBeInTheDocument();
  });

  it('renders nothing while the active bundle lookup is loading', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(true);
    mockUseActiveXtmPlatformBundleQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const element = await Page();
    render(element);

    expect(screen.queryByTestId('private-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bundle-dashboard')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Service.Trials.XtmPlatform.Page.Breadcrumb')
    ).not.toBeInTheDocument();
  });

  it('calls notFound when the XtmPlatformTrial feature flag is disabled', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(false);

    await Page();

    expect(notFound).toHaveBeenCalled();
  });
});
