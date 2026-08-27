import { FeatureVotingCallout } from '@/components/feature-voting/FeatureVotingCallout';
import testRender from '@/utils/test/test-render';
import { act, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

const resolveCurrentRound = async (
  environment: ReturnType<typeof createMockEnvironment>,
  currentVotingRound: {
    id: string;
    name: string;
    description: string | null;
    theme?: string;
  } | null
) => {
  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        Query() {
          return { currentVotingRound };
        },
      })
    );
  });
};

describe('FeatureVotingCallout', () => {
  it('should invite to vote and link to the public page when a round is open', async () => {
    // Given the roadmap is browsed from its public route
    vi.mocked(usePathname).mockReturnValue(
      '/en/cybersecurity-solutions/xtm-platform-roadmap'
    );
    const environment = createMockEnvironment();

    // When
    testRender(<FeatureVotingCallout serviceInstanceId="instance-1" />, {
      relayConfig: environment,
    });
    await resolveCurrentRound(environment, {
      id: 'round-1',
      name: 'Feature vote #1',
      description: 'Tell us what matters to you',
    });

    // Then
    const link = screen.getByRole('link', {
      name: 'FeatureVoting.CalloutButton',
    });
    expect(link).toHaveAttribute(
      'href',
      '/en/cybersecurity-solutions/xtm-platform-roadmap/feature-voting'
    );
    expect(screen.getByText('Tell us what matters to you')).toBeInTheDocument();
  });

  it('should link to the private page when the roadmap is browsed while logged in', async () => {
    // Given
    vi.mocked(usePathname).mockReturnValue(
      '/app/service/xtm_platform_roadmap/instance-1'
    );
    const environment = createMockEnvironment();

    // When
    testRender(<FeatureVotingCallout serviceInstanceId="instance-1" />, {
      relayConfig: environment,
    });
    await resolveCurrentRound(environment, {
      id: 'round-1',
      name: 'Feature vote #1',
      description: null,
    });

    // Then
    expect(
      screen.getByRole('link', { name: 'FeatureVoting.CalloutButton' })
    ).toHaveAttribute(
      'href',
      '/app/service/xtm_platform_roadmap/instance-1/feature-voting'
    );
  });

  it.each([
    { theme: 'default', hasMosaic: false },
    { theme: 'thread', hasMosaic: true },
  ])(
    'should dress the banner with the $theme identity',
    async ({ theme, hasMosaic }) => {
      // Given
      vi.mocked(usePathname).mockReturnValue(
        '/en/cybersecurity-solutions/xtm-platform-roadmap'
      );
      const environment = createMockEnvironment();

      // When
      testRender(<FeatureVotingCallout serviceInstanceId="instance-1" />, {
        relayConfig: environment,
      });
      await resolveCurrentRound(environment, {
        id: 'round-1',
        name: 'Feature vote #1',
        description: 'Tell us what matters to you',
        theme,
      });

      // Then
      const banner = screen
        .getByText('FeatureVoting.CalloutTitle')
        .closest('div[class*="rounded"]');
      const style = banner?.getAttribute('style') ?? '';
      expect(style.includes('conic-gradient')).toBe(hasMosaic);
    }
  );

  // The roadmap must never advertise a vote that would land on an empty page.
  it('should render nothing when no round is collecting votes', async () => {
    // Given
    vi.mocked(usePathname).mockReturnValue(
      '/en/cybersecurity-solutions/xtm-platform-roadmap'
    );
    const environment = createMockEnvironment();

    // When
    testRender(<FeatureVotingCallout serviceInstanceId="instance-1" />, {
      relayConfig: environment,
    });
    await resolveCurrentRound(environment, null);

    // Then
    expect(
      screen.queryByRole('link', { name: 'FeatureVoting.CalloutButton' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('FeatureVoting.CalloutTitle')
    ).not.toBeInTheDocument();
  });
});
