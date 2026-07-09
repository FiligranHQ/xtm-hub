import { TryFiligranProductsBanner } from '@/components/service/trial-instances/banner/TryFiligranProductsBanner';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifier } from '@graphql/generated';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

const OpenCTITrial = {
  serviceInstanceId: 'id',
  platformIdentifier: PlatformIdentifier.Opencti,
};
const OpenAEVTrial = {
  serviceInstanceId: 'id2',
  platformIdentifier: PlatformIdentifier.Openaev,
};

describe('Filigran product banner text', () => {
  it.each`
    availableTrials                                             | registeredPlatforms | expectedText                        | nonExpectedText
    ${[PlatformIdentifier.Openaev]}                             | ${[OpenCTITrial]}   | ${'Service.Trials.ExplorePlatform'} | ${'Service.Trials.ExploreProducts'}
    ${[PlatformIdentifier.Opencti]}                             | ${[OpenAEVTrial]}   | ${'Service.Trials.ExplorePlatform'} | ${'Service.Trials.ExploreProducts'}
    ${[PlatformIdentifier.Opencti, PlatformIdentifier.Openaev]} | ${[]}               | ${'Service.Trials.ExploreProducts'} | ${null}
  `(
    'should render the correct text depending the registration',
    async ({
      availableTrials,
      registeredPlatforms,
      expectedText,
      nonExpectedText,
    }) => {
      // Given
      const environment = createMockEnvironment();
      // The component is rendered
      const { queryByText } = testRender(<TryFiligranProductsBanner />, {
        relayConfig: environment,
      });

      // AND The user has registered platforms
      await act(async () => {
        environment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, {
            Query() {
              return {
                trialDeployments: {
                  availableTrials: availableTrials,
                  deployed: registeredPlatforms,
                  isBlacklisted: false,
                },
              };
            },
          })
        );
      });

      // Then
      const bannerText = await queryByText(expectedText);
      expect(bannerText).toBeInTheDocument();
      nonExpectedText &&
        expect(await queryByText(nonExpectedText)).not.toBeInTheDocument();
    }
  );

  it('should not display banner when user is registered with OpenAEV and OpenCTI', async () => {
    // Given
    // The component is rendered
    const environment = createMockEnvironment();

    const { container } = testRender(<TryFiligranProductsBanner />, {
      relayConfig: environment,
    });
    // AND the user has 2 trials
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [],
                deployed: [OpenAEVTrial, OpenCTITrial],
                isBlacklisted: false,
              },
            };
          },
        })
      );
    });

    // Then
    expect(container.firstChild).toBeNull();
    const callout = container.querySelector('[class*="callout"]');
    expect(callout).not.toBeInTheDocument();
  });

  it('should display learn more dropdown when no trials', async () => {
    // GIVEN
    const environment = createMockEnvironment();
    // The component is rendered
    const { findByRole, getByRole } = testRender(
      <TryFiligranProductsBanner />,
      {
        relayConfig: environment,
      }
    );
    //AND The user has no trial
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [
                  PlatformIdentifier.Openaev,
                  PlatformIdentifier.Opencti,
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
    // The user clicks on learn more
    const learnMoreButton = await findByRole('button', {
      name: 'Service.Trials.LearnMore.Link',
    });
    const user = userEvent.setup();
    await user.click(learnMoreButton);

    // THEN
    const startOpenCTITrial = getByRole('link', {
      name: /OpenCTI/i,
    });
    expect(startOpenCTITrial).toBeInTheDocument();
    const startOpenAEVTrial = getByRole('link', {
      name: /OpenAEV/i,
    });
    expect(startOpenAEVTrial).toBeInTheDocument();
  });

  it.each`
    productRegistered | productAvailable                | platformRegistered | linkToLearnMore
    ${'OpenAEV'}      | ${[PlatformIdentifier.Opencti]} | ${[OpenAEVTrial]}  | ${'opencti-free-trial'}
    ${'OpenCTI'}      | ${[PlatformIdentifier.Openaev]} | ${[OpenCTITrial]}  | ${'openaev-free-trial'}
  `(
    'should learn more redirects to correct page when platform registered is $productRegistered',
    async ({ productAvailable, platformRegistered, linkToLearnMore }) => {
      // Given
      const environment = createMockEnvironment();
      // The component is rendered
      const { getByRole } = testRender(<TryFiligranProductsBanner />, {
        relayConfig: environment,
      });
      //AND The user has trial
      await act(async () => {
        environment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, {
            Query() {
              return {
                trialDeployments: {
                  availableTrials: productAvailable,
                  deployed: platformRegistered,
                  isBlacklisted: false,
                },
              };
            },
          })
        );
      });

      // Then
      const learnMoreLink = getByRole('link', {
        name: 'Service.Trials.LearnMore.Link',
      });
      const href = learnMoreLink.getAttribute('href');
      expect(href).toContain(linkToLearnMore);
    }
  );
  it.each`
    userCapabilities                                                 | shouldDisplayStartTrialButton
    ${['ADMINISTRATE_ORGANIZATION']}                                 | ${true}
    ${['MANAGE_PLATFORM_REGISTRATION']}                              | ${true}
    ${['MANAGE_PLATFORM_REGISTRATION', 'ADMINISTRATE_ORGANIZATION']} | ${true}
    ${[]}                                                            | ${false}
    ${['OTHER']}                                                     | ${false}
  `(
    'should display startTrialButton is $shouldDisplayStartTrialButton when the user has capa $userCapbilities',
    async ({ userCapabilities, shouldDisplayStartTrialButton }) => {
      // GIVEN
      const environment = createMockEnvironment();
      // The component is rendered with correct user capabilities
      const { queryByText } = testRender(<TryFiligranProductsBanner />, {
        me: {
          selected_org_capabilities: userCapabilities,
        },
        relayConfig: environment,
      });

      // AND The user has no trial
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

      // Then
      const startTrialButton = await queryByText('Service.Trials.StartTrial');
      shouldDisplayStartTrialButton
        ? expect(startTrialButton).toBeInTheDocument()
        : expect(startTrialButton).not.toBeInTheDocument();
    }
  );
});
