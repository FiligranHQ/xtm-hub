import Page from '@app/(application)/app/(user)/service/xtm-platform-trial/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => Object.assign((key: string) => key, {}),
}));

vi.mock(
  '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel',
  () => ({
    PrivateXtmPlatformTrialPanel: () => <div data-testid="private-panel" />,
  })
);

describe('private xtm-platform-trial page', () => {
  it('renders the breadcrumb and the private panel with limitations shown', async () => {
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
});
