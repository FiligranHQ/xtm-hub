import { XtmPlatformTrialPage } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('XtmPlatformTrialPage', () => {
  it('renders the header, pitch and given panel', () => {
    render(
      <XtmPlatformTrialPage panel={<div data-testid="panel">Panel</div>} />
    );

    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Overline')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Service.Trials.XtmPlatform.Page.Title',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.PitchTitle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('does not render the limitations section by default', () => {
    render(<XtmPlatformTrialPage panel={<div>Panel</div>} />);

    expect(
      screen.queryByText('Service.Trials.XtmPlatform.Page.Limitations.Title')
    ).not.toBeInTheDocument();
  });

  it('renders the limitations section when showLimitations is true', () => {
    render(
      <XtmPlatformTrialPage
        panel={<div>Panel</div>}
        showLimitations
      />
    );

    expect(
      screen.getByText('Service.Trials.XtmPlatform.Page.Limitations.Title')
    ).toBeInTheDocument();
  });
});
