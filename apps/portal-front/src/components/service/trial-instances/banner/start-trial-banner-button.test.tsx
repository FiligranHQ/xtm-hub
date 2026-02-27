import { StartTrialBannerButton } from '@/components/service/trial-instances/banner/start-trial-banner-button';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

vi.mock('next/navigation', (importOriginal) => ({
  ...importOriginal(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Start trial button in the banner', () => {
  it('should display dropdown menu when no trial', async () => {
    // GIVEN
    const environment = createMockEnvironment();
    // The component is rendered
    const { findByText, getByRole } = testRender(<StartTrialBannerButton />, {
      relayConfig: environment,
    });
    //AND The user has no trial
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [
                  PlatformIdentifierEnum.OPENCTI,
                  PlatformIdentifierEnum.OPENAEV,
                ],
                deployed: [],
                isBlacklisted: false,
              },
            };
          },
        })
      );
    });

    // WHEN
    // The user clicks on start a trial
    const startTrialButton = await findByText(/Start your free trial/i);
    const user = userEvent.setup();
    await user.click(startTrialButton);

    // THEN
    // The button should display both products
    const startOpenCTITrial = getByRole('button', {
      name: /OpenCTI/i,
    });
    expect(startOpenCTITrial).toBeInTheDocument();
    const startOpenAEVTrial = getByRole('button', {
      name: /OpenAEV/i,
    });
    expect(startOpenAEVTrial).toBeInTheDocument();
  });
  it('should display disabled button when blacklisted', async () => {
    // GIVEN
    const environment = createMockEnvironment();
    // The component is rendered
    // AND The user is blacklisted
    const { getByRole } = testRender(<StartTrialBannerButton />, {
      me: {
        email: 'domain@test.com',
      },
      settings: {
        domains_blacklist: 'autre.fr, test.com, coucou.io',
      },
      relayConfig: environment,
    });
    //AND The user has no trial
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [
                  PlatformIdentifierEnum.OPENCTI,
                  PlatformIdentifierEnum.OPENAEV,
                ],
                deployed: [],
                isBlacklisted: true,
              },
            };
          },
        })
      );
    });

    // WHEN

    // THEN
    // The button should be disabled
    const startTrialButton = getByRole('button', {
      name: /Start your free trial/i,
    });
    expect(startTrialButton).toBeDisabled();
  });
  it('should not display dropdown when 1 free trial', async () => {
    // GIVEN
    const environment = createMockEnvironment();
    // The component is rendered
    const { findByText, queryByRole } = testRender(<StartTrialBannerButton />, {
      relayConfig: environment,
    });
    //AND The user has 1 trial
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [PlatformIdentifierEnum.OPENAEV],
                deployed: [
                  {
                    serviceInstanceId: 'id',
                    platformIdentifier: PlatformIdentifierEnum.OPENCTI,
                  },
                ],
                isBlacklisted: false,
              },
            };
          },
        })
      );
    });
    // WHEN
    // The user clicks on start a trial
    const startTrialButton = await findByText(/Start your free trial/i);
    const user = userEvent.setup();
    await user.click(startTrialButton);

    // THEN
    // It should not display dropdown
    const startOpenCTITrial = queryByRole('button', {
      name: /OpenCTI/i,
    });
    expect(startOpenCTITrial).not.toBeInTheDocument();
    const startOpenAEVTrial = queryByRole('button', {
      name: /OpenAEV/i,
    });
    expect(startOpenAEVTrial).not.toBeInTheDocument();
  });
});
