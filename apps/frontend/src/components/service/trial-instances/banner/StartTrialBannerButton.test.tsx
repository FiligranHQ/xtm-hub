import { StartTrialBannerButton } from '@/components/service/trial-instances/banner/StartTrialBannerButton';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifier } from '@graphql/generated';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  invalidatePrivateNavigationQueries: vi.fn(),
}));

vi.mock('@/components/menu/private-navigation-query-invalidation', () => ({
  invalidatePrivateNavigationQueries:
    testState.invalidatePrivateNavigationQueries,
}));

vi.mock('@/components/service/trial-instances/TryFiligranProductForm', () => ({
  TryFiligranProductForm: ({
    handleSubmit,
  }: {
    handleSubmit: (values: { acceptTerms: boolean }) => void;
  }) => (
    <button
      type="button"
      onClick={() => handleSubmit({ acceptTerms: true })}>
      submit-trial-form
    </button>
  ),
  tryFiligranProductFormSchema: {},
}));

describe('Start trial button in the banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should display dropdown menu when no trial', async () => {
    // GIVEN
    const environment = createMockEnvironment();
    // The component is rendered
    const { findByText, getByText } = testRender(<StartTrialBannerButton />, {
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
                  PlatformIdentifier.Opencti,
                  PlatformIdentifier.Openaev,
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
    const startTrialButton = await findByText('Service.Trials.StartTrial');
    const user = userEvent.setup();
    await user.click(startTrialButton);

    // THEN
    // The button should display both products
    const startOpenCTITrial = getByText('OpenCTI');
    expect(startOpenCTITrial).toBeInTheDocument();
    const startOpenAEVTrial = getByText('OpenAEV');
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
                  PlatformIdentifier.Opencti,
                  PlatformIdentifier.Openaev,
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
      name: 'Service.Trials.StartTrial',
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
                availableTrials: [PlatformIdentifier.Openaev],
                deployed: [
                  {
                    serviceInstanceId: 'id',
                    platformIdentifier: PlatformIdentifier.Opencti,
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
    const startTrialButton = await findByText('Service.Trials.StartTrial');
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
  it('invalidates private navigation queries on successful deployment request completion', async () => {
    const environment = createMockEnvironment();
    const { findByText } = testRender(<StartTrialBannerButton />, {
      relayConfig: environment,
    });

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [PlatformIdentifier.Openaev],
                deployed: [
                  {
                    serviceInstanceId: 'id',
                    platformIdentifier: PlatformIdentifier.Opencti,
                  },
                ],
                isBlacklisted: false,
              },
            };
          },
        })
      );
    });

    const user = userEvent.setup();
    await user.click(await findByText('Service.Trials.StartTrial'));
    await user.click(screen.getByRole('button', { name: 'submit-trial-form' }));

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Mutation() {
            return {
              createDeploymentRequest: {
                service_instance_id: 'service-instance-id',
              },
            };
          },
        })
      );
    });

    expect(testState.invalidatePrivateNavigationQueries).toHaveBeenCalledOnce();
  });
});
