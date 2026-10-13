import { ThreatPulseTrending } from '@/components/admin/threat-pulse/ThreatPulseTrending';
import testRender from '@/utils/test/test-render';
import {
  PulseObjectType,
  PulsePeriod,
  PulsePrevalenceBucket,
  PulseTrendDirection,
  type ThreatPulseOverviewQuery,
} from '@graphql/generated';
import { mockPulseNetworkOverview } from '@graphql/mocks';
import { screen } from '@testing-library/react';

const KEY_ID = 'a1b2c3d4e5f6';

const mocks = vi.hoisted(() => ({
  useThreatPulseTrendingQuery: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useThreatPulseTrendingQuery: Object.assign(
      mocks.useThreatPulseTrendingQuery,
      {
        getKey: actual.useThreatPulseTrendingQuery.getKey,
        getRootKey: actual.useThreatPulseTrendingQuery.getRootKey,
      }
    ),
  };
});

const OVERVIEW = mockPulseNetworkOverview({
  keys: { tracked: 10, published: 4, suppressed: 6 },
}) as unknown as ThreatPulseOverviewQuery['pulseNetworkOverview'];

const lastQueryVariables = () =>
  mocks.useThreatPulseTrendingQuery.mock.lastCall?.[1];

describe('ThreatPulseTrending', () => {
  beforeEach(() => {
    mocks.useThreatPulseTrendingQuery.mockReset();
    mocks.useThreatPulseTrendingQuery.mockReturnValue({
      data: {
        pulseNetworkTrending: {
          day: '2026-10-12',
          period: PulsePeriod.Last_7Days,
          computed_at: '2026-10-12T07:30:00.000Z',
          items: [
            {
              key_id: KEY_ID,
              object_type: PulseObjectType.Malware,
              platforms_bucket: '5-9',
              prevalence_bucket: PulsePrevalenceBucket.Common,
              trend: PulseTrendDirection.Rising,
              growth: 6,
              first_seen_network: '2026-10-06',
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
  });

  it('should list what the network publishes over the last 7 days', () => {
    // When
    testRender(<ThreatPulseTrending overview={OVERVIEW} />);

    // Then
    expect(lastQueryVariables()).toEqual({
      period: PulsePeriod.Last_7Days,
      first: 50,
    });
    expect(screen.getByText('ThreatPulse.Trending.Ratio')).toBeInTheDocument();
    expect(screen.getByText(KEY_ID)).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.ObjectType.malware')
    ).toBeInTheDocument();
    expect(screen.getByText('5-9')).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.Prevalence.common')
    ).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.Trending.ComputedAt')
    ).toBeInTheDocument();
  });

  it('should fetch the last 30 days when the user picks that period', async () => {
    // Given
    const { user } = testRender(<ThreatPulseTrending overview={OVERVIEW} />);

    // When
    await user.click(
      screen.getByRole('tab', { name: 'ThreatPulse.Period.last_30_days' })
    );

    // Then
    expect(lastQueryVariables()).toEqual({
      period: PulsePeriod.Last_30Days,
      first: 50,
    });
  });

  it('should show the first ten items until the user asks for all of them', async () => {
    // Given
    const items = Array.from({ length: 12 }, (_, index) => ({
      key_id: `${KEY_ID}${index}`,
      object_type: PulseObjectType.Malware,
      platforms_bucket: '5-9',
      prevalence_bucket: PulsePrevalenceBucket.Common,
      trend: PulseTrendDirection.Rising,
      growth: 6,
      first_seen_network: '2026-10-06',
    }));
    mocks.useThreatPulseTrendingQuery.mockReturnValue({
      data: {
        pulseNetworkTrending: {
          day: '2026-10-12',
          period: PulsePeriod.Last_7Days,
          computed_at: '2026-10-12T07:30:00.000Z',
          items,
        },
      },
      isLoading: false,
      isError: false,
    });
    const { user } = testRender(<ThreatPulseTrending overview={OVERVIEW} />);
    expect(screen.getByText(`${KEY_ID}9`)).toBeInTheDocument();
    expect(screen.queryByText(`${KEY_ID}10`)).not.toBeInTheDocument();

    // When
    await user.click(
      screen.getByRole('button', { name: 'ThreatPulse.Trending.ShowAll' })
    );

    // Then
    expect(screen.getByText(`${KEY_ID}11`)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ThreatPulse.Trending.ShowFewer' })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('should say so when nothing reaches the anonymity threshold', () => {
    // Given
    mocks.useThreatPulseTrendingQuery.mockReturnValue({
      data: {
        pulseNetworkTrending: {
          day: '2026-10-12',
          period: PulsePeriod.Last_7Days,
          computed_at: null,
          items: [],
        },
      },
      isLoading: false,
      isError: false,
    });

    // When
    testRender(<ThreatPulseTrending overview={OVERVIEW} />);

    // Then
    expect(screen.getByText('ThreatPulse.Trending.Empty')).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.Trending.NotComputed')
    ).toBeInTheDocument();
  });
});
