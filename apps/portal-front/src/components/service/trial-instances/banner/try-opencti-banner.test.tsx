import { TryOpenCTIBanner } from '@/components/service/trial-instances/banner/try-opencti-banner';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { act } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

vi.mock('next/navigation', (importOriginal) => ({
  ...importOriginal(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('useFreeTrial with Relay Mock', () => {
  it('should return Learn more when the user has no right', async () => {
    const environment = createMockEnvironment();

    const { getByText, getByRole, queryByRole } = testRender(
      <TryOpenCTIBanner />,
      {
        relayConfig: environment,
      }
    );

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              registeredPlatforms: [], // Empty array = no trials
            };
          },
        })
      );
    });

    expect(getByText('Learn more')).toBeTruthy();
    const link = getByRole('link', { name: /learn more/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe(
      'http://localhost:3002/app/service/free-trial'
    );
    const startTrialButton = queryByRole('button', {
      name: /Start your free trial/i,
    });
    expect(startTrialButton).not.toBeInTheDocument();
  });

  it('should return Learn more when the user is Admin Orga', async () => {
    const environment = createMockEnvironment();

    const { getByText, getByRole, queryByRole } = testRender(
      <TryOpenCTIBanner />,
      {
        me: {
          selected_org_capabilities: ['ADMINISTRATE_ORGANIZATION'],
        },
        relayConfig: environment,
      }
    );

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) => {
        expect(operation.request.node.params.name).toBe(
          'registerRegisteredPlatformsQuery'
        );

        return MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              registeredPlatforms: [], // Empty array = no trials
            };
          },
        });
      });
    });

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) => {
        expect(operation.request.node.params.name).toBe(
          'trialInstancesTrialsForOrgaQuery'
        );

        return MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              trialDeployments: {
                availableTrials: [PlatformIdentifierEnum.OPENCTI],
                deployed: [],
                isBlacklisted: false,
              },
            };
          },
        });
      });
    });

    expect(getByText('Learn more')).toBeTruthy();
    const link = getByRole('link', { name: /learn more/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe(
      'http://localhost:3002/app/service/free-trial'
    );
    const startTrialButton = queryByRole('button', {
      name: /Start your free trial/i,
    });
    expect(startTrialButton).toBeTruthy();
  });

  it('should display trial banner when trial exists', async () => {
    const environment = createMockEnvironment();

    const { getByRole, getByText } = testRender(<TryOpenCTIBanner />, {
      relayConfig: environment,
    });

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              registeredPlatforms: [
                {
                  deployment_request: {
                    type: 'trial',
                    counts_in_orga_quota: true,
                  },
                },
              ],
            };
          },
        })
      );
    });

    expect(getByText(/Your OpenCTI free trial is active/i)).toBeTruthy();
    expect(getByRole('link', { name: /go to my trial/i })).toBeTruthy();
  });
});
