import { ThreatPulsePlatforms } from '@/components/admin/threat-pulse/ThreatPulsePlatforms';
import { toCursor } from '@/hooks/use-table-pagination';
import testRender from '@/utils/test/test-render';
import {
  OrderingMode,
  PulseNetworkPlatformOrdering,
  PulseNetworkPlatformStatus,
  PulseRegionBucket,
  PulseSectorBucket,
  type ThreatPulsePlatformRowFragment,
} from '@graphql/generated';
import { fireEvent, screen, waitFor } from '@testing-library/react';

const SEARCH_TERM = 'soc';

const mocks = vi.hoisted(() => ({
  useThreatPulsePlatformsQuery: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useThreatPulsePlatformsQuery: Object.assign(
      mocks.useThreatPulsePlatformsQuery,
      {
        getKey: actual.useThreatPulsePlatformsQuery.getKey,
        getRootKey: actual.useThreatPulsePlatformsQuery.getRootKey,
      }
    ),
  };
});

const lastQueryVariables = () =>
  mocks.useThreatPulsePlatformsQuery.mock.lastCall?.[1];

const buildPlatform = (
  overrides: Partial<ThreatPulsePlatformRowFragment> = {}
): ThreatPulsePlatformRowFragment => ({
  id: 'service-instance-1',
  title: 'Paris SOC',
  organization_name: 'Filigran',
  sector_bucket: PulseSectorBucket.Finance,
  region_bucket: PulseRegionBucket.Europe,
  status: PulseNetworkPlatformStatus.Contributing,
  first_contribution_day: '2026-09-13',
  last_contribution_day: '2026-10-12',
  last_batch_at: '2026-10-12T08:00:00.000Z',
  batches_last_30_days: 30,
  records_last_30_days: 1200,
  purge_requests: 0,
  last_purge_day: null,
  ...overrides,
});

const mockPlatforms = (nodes: ThreatPulsePlatformRowFragment[]) =>
  mocks.useThreatPulsePlatformsQuery.mockReturnValue({
    data: {
      pulseNetworkPlatforms: {
        totalCount: nodes.length,
        edges: nodes.map((node) => ({ node })),
      },
    },
    isLoading: false,
    isError: false,
  });

describe('ThreatPulsePlatforms', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.useThreatPulsePlatformsQuery.mockReset();
    mockPlatforms([]);
  });

  it('should fetch the platforms with the most active first by default', () => {
    // When
    testRender(<ThreatPulsePlatforms />);

    // Then
    expect(lastQueryVariables()).toEqual({
      count: 50,
      cursor: toCursor(50, 0),
      orderBy: PulseNetworkPlatformOrdering.RecordsLast_30Days,
      orderMode: OrderingMode.Desc,
      searchTerm: null,
      status: null,
    });
  });

  it('should show the organization, the buckets and the status of each platform', () => {
    // Given
    mockPlatforms([
      buildPlatform(),
      buildPlatform({
        id: 'service-instance-2',
        title: 'Lyon CERT',
        organization_name: null,
        sector_bucket: null,
        region_bucket: null,
        status: PulseNetworkPlatformStatus.PreviewOnly,
        purge_requests: 2,
        last_purge_day: '2026-10-10',
      }),
    ]);

    // When
    testRender(<ThreatPulsePlatforms />);

    // Then
    expect(screen.getByText('Paris SOC')).toBeInTheDocument();
    expect(screen.getByText('Filigran')).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.Platforms.BucketPair')
    ).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.PlatformStatus.contributing')
    ).toBeInTheDocument();
    expect(screen.getByText('Lyon CERT')).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.PlatformStatus.preview_only')
    ).toBeInTheDocument();
    expect(
      screen.getByText('ThreatPulse.Platforms.PurgeValue')
    ).toBeInTheDocument();
    expect(screen.queryByText('ThreatPulse.Platforms.Empty')).toBeNull();
  });

  it('should say so when no platform matches', () => {
    // When
    testRender(<ThreatPulsePlatforms />);

    // Then
    expect(screen.getByText('ThreatPulse.Platforms.Empty')).toBeInTheDocument();
  });

  it('should fetch the platforms ordered by title when the user sorts the platform column', () => {
    // Given
    mockPlatforms([buildPlatform()]);
    testRender(<ThreatPulsePlatforms />);

    // When
    fireEvent.click(screen.getByText('ThreatPulse.Platforms.Title'));

    // Then
    expect(lastQueryVariables()).toMatchObject({
      orderBy: PulseNetworkPlatformOrdering.Title,
      orderMode: OrderingMode.Asc,
    });
  });

  it('should fetch the platforms matching the trimmed search term', async () => {
    // Given
    testRender(<ThreatPulsePlatforms />);

    // When
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'ThreatPulse.Platforms.Search' }),
      { target: { value: `  ${SEARCH_TERM}  ` } }
    );

    // Then
    await waitFor(() =>
      expect(lastQueryVariables()).toMatchObject({ searchTerm: SEARCH_TERM })
    );
  });

  it('should fetch the platforms of the status the user picks', async () => {
    // Given
    const { user } = testRender(<ThreatPulsePlatforms />);

    // When
    await user.click(
      screen.getByRole('combobox', {
        name: 'ThreatPulse.Platforms.StatusFilter',
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: 'ThreatPulse.PlatformStatus.lapsed',
      })
    );

    // Then
    expect(lastQueryVariables()).toMatchObject({
      status: PulseNetworkPlatformStatus.Lapsed,
      cursor: toCursor(50, 0),
    });
  });
});
