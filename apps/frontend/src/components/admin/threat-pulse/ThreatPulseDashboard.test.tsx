import { ThreatPulseDashboard } from '@/components/admin/threat-pulse/ThreatPulseDashboard';
import testRender from '@/utils/test/test-render';
import {
  PulseEventKind,
  PulseNetworkOperation,
  PulseNetworkRejectionCode,
  PulseObjectType,
  PulseRegionBucket,
  PulseSectorBucket,
  type ThreatPulseOverviewQuery,
} from '@graphql/generated';
import { screen, within } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  useThreatPulseOverviewQuery: vi.fn(),
  useThreatPulseTrendingQuery: vi.fn(),
  useThreatPulsePlatformsQuery: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  const withKeys = <T extends { getKey: unknown; getRootKey: unknown }>(
    mock: ReturnType<typeof vi.fn>,
    hook: T
  ) =>
    Object.assign(mock, { getKey: hook.getKey, getRootKey: hook.getRootKey });
  return {
    ...actual,
    useThreatPulseOverviewQuery: withKeys(
      mocks.useThreatPulseOverviewQuery,
      actual.useThreatPulseOverviewQuery
    ),
    useThreatPulseTrendingQuery: withKeys(
      mocks.useThreatPulseTrendingQuery,
      actual.useThreatPulseTrendingQuery
    ),
    useThreatPulsePlatformsQuery: withKeys(
      mocks.useThreatPulsePlatformsQuery,
      actual.useThreatPulsePlatformsQuery
    ),
  };
});

type Overview = ThreatPulseOverviewQuery['pulseNetworkOverview'];

const DAYS = ['2026-10-10', '2026-10-11', '2026-10-12'];

const buildOverview = (overrides: Partial<Overview> = {}): Overview => ({
  day: '2026-10-12',
  settings: {
    enabled: true,
    disabled_reason: null,
    k_threshold: 5,
    retention_months: 13,
    retention_days: 396,
    digest_size: 5000,
    contribution_window_days: 7,
    contribution_grace_days: 14,
    trending_cache_ttl_minutes: 60,
  },
  platforms: {
    registered: 14,
    contributing: 12,
    active_last_24_hours: 11,
    active_last_7_days: 12,
    preview_only: 1,
    lapsed: 1,
    unregistered: 0,
    digest_readers_last_24_hours: 9,
  },
  keys: { tracked: 4200, published: 860, suppressed: 3340 },
  ingestion: {
    batches_today: 11,
    records_today: 5400,
    batches_last_30_days: 352,
    records_last_30_days: 171000,
  },
  activity: DAYS.map((day, index) => ({
    day,
    batches: 10 + index,
    records: 5000 + index * 100,
    events: 9000 + index * 100,
    platforms: 10 + index,
  })),
  sectors: [
    {
      sector_bucket: PulseSectorBucket.Finance,
      platforms: 6,
      events: 80000,
    },
  ],
  regions: [
    { region_bucket: PulseRegionBucket.Europe, platforms: 8, events: 90000 },
  ],
  kinds: [
    {
      object_type: PulseObjectType.Indicator,
      event_kind: PulseEventKind.Sighted,
      platforms: 12,
      events: 60000,
    },
  ],
  rejections: [
    {
      operation: PulseNetworkOperation.PulseLookup,
      code: PulseNetworkRejectionCode.PulseRateLimited,
      requests: 3,
      last_day: '2026-10-11',
    },
  ],
  last_digest_at: '2026-10-12T07:00:00.000Z',
  last_trending_at: '2026-10-12T07:30:00.000Z',
  ...overrides,
});

const mockOverview = (overview: Overview) =>
  mocks.useThreatPulseOverviewQuery.mockReturnValue({
    data: { pulseNetworkOverview: overview },
    isLoading: false,
    isError: false,
  });

describe('ThreatPulseDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.useThreatPulseOverviewQuery.mockReset();
    mocks.useThreatPulseTrendingQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
    mocks.useThreatPulsePlatformsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  it('should show a spinner while the figures load', () => {
    // Given
    mocks.useThreatPulseOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    expect(screen.getByRole('status')).toHaveTextContent('Utils.Loading');
  });

  it('should say so when the figures cannot be loaded', () => {
    // Given
    mocks.useThreatPulseOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    expect(screen.getByText('ThreatPulse.LoadError')).toBeInTheDocument();
  });

  it('should show every figure of the network', () => {
    // Given
    mockOverview(buildOverview());

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    const tile = (label: string) =>
      screen.getByText(label).closest('div') as HTMLElement;
    expect(
      within(tile('ThreatPulse.Cards.Contributing')).getByText('12')
    ).toBeInTheDocument();
    expect(
      within(tile('ThreatPulse.Cards.Keys')).getByText('4,200')
    ).toBeInTheDocument();
    expect(
      within(tile('ThreatPulse.Cards.LastMonth')).getByText('352')
    ).toBeInTheDocument();
    expect(
      within(tile('ThreatPulse.Cards.Privacy')).getByText(
        'ThreatPulse.Cards.PrivacyValue'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('ThreatPulse.Disabled.Title')
    ).not.toBeInTheDocument();
  });

  it('should draw one column per day of activity', () => {
    // Given
    mockOverview(buildOverview());

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    const chart = screen.getByRole('figure', {
      name: 'ThreatPulse.Activity.Chart.records',
    });
    expect(within(chart).getAllByRole('listitem')).toHaveLength(DAYS.length);
  });

  it('should break the coverage and the rejections down', () => {
    // Given
    mockOverview(buildOverview());

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    expect(
      screen.getByRole('progressbar', { name: 'ThreatPulse.Sector.finance' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'ThreatPulse.Region.europe' })
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('table', { name: 'ThreatPulse.Coverage.Kinds' })
      ).getByRole('rowheader', { name: 'ThreatPulse.ObjectType.indicator' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'ThreatPulse.Health.Rejection' })
    ).toBeInTheDocument();
  });

  it('should say when no request was refused', () => {
    // Given
    mockOverview(buildOverview({ rejections: [] }));

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    expect(screen.getByText('ThreatPulse.Health.Empty')).toBeInTheDocument();
  });

  it('should warn when Threat Pulse is disabled and show unknown figures as such', () => {
    // Given
    const overview = buildOverview();
    mockOverview(
      buildOverview({
        settings: {
          ...overview.settings,
          enabled: false,
          disabled_reason: 'missing_secret',
        },
        platforms: {
          ...overview.platforms,
          preview_only: null,
          unregistered: null,
        },
      })
    );

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    expect(screen.getByText('ThreatPulse.Disabled.Title')).toBeInTheDocument();
    expect(
      within(
        screen
          .getByText('ThreatPulse.Cards.PreviewOnly')
          .closest('div') as HTMLElement
      ).getByText('ThreatPulse.Cards.Unknown')
    ).toBeInTheDocument();
  });

  it('should leave out the details of settings that are invalid', () => {
    // Given
    const overview = buildOverview();
    mockOverview(
      buildOverview({
        settings: {
          ...overview.settings,
          enabled: false,
          disabled_reason: 'invalid_settings',
          k_threshold: null,
          digest_size: null,
          contribution_window_days: null,
          contribution_grace_days: null,
          trending_cache_ttl_minutes: null,
        },
      })
    );

    // When
    testRender(<ThreatPulseDashboard />);

    // Then
    expect(
      screen.queryByText('ThreatPulse.Cards.LapsedDetail')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('ThreatPulse.Cards.DigestSize')
    ).not.toBeInTheDocument();
    expect(screen.getByText('ThreatPulse.Cards.Retention')).toBeInTheDocument();
    expect(
      within(
        screen
          .getByText('ThreatPulse.Cards.Privacy')
          .closest('div') as HTMLElement
      ).getByText('ThreatPulse.Cards.Unknown')
    ).toBeInTheDocument();
  });
});
