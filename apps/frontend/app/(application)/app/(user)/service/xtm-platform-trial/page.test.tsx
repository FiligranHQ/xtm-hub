import { isFeatureEnabled } from '@/utils/settings.service';
import Page from '@app/(application)/app/(user)/service/xtm-platform-trial/page';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => Object.assign((key: string) => key, {}),
}));

vi.mock('@/utils/settings.service', () => ({
  isFeatureEnabled: vi.fn(),
}));

vi.mock(
  '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel',
  () => ({
    PrivateXtmPlatformTrialPanel: () => <div data-testid="private-panel" />,
  })
);

describe('private xtm-platform-trial page', () => {
  beforeEach(() => {
    vi.mocked(isFeatureEnabled).mockReset();
    vi.mocked(notFound).mockClear();
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

  it('calls notFound when the XtmPlatformTrial feature flag is disabled', async () => {
    vi.mocked(isFeatureEnabled).mockResolvedValue(false);

    await Page();

    expect(notFound).toHaveBeenCalled();
  });
});
