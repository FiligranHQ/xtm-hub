import { FeatureVotingList } from '@/components/feature-voting/FeatureVotingList';
import { mockGraphqlQuery } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { CurrentVotingRoundQuery, FiligranProduct } from '@graphql/generated';
import { mockVotableFeature, mockVotingRound } from '@graphql/mocks';
import { screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const GQL_OPERATION_CURRENT_ROUND = 'CurrentVotingRound';

const ROADMAP_HREF = '/app/service/xtm_platform_roadmap/instance-1';

const openctiFeature = mockVotableFeature({
  id: 'feature-opencti',
  title: 'AI-powered report triage',
  product: FiligranProduct.Opencti,
  has_my_vote: false,
});

const openaevFeature = mockVotableFeature({
  id: 'feature-openaev',
  title: 'Scenario library',
  product: FiligranProduct.Openaev,
  has_my_vote: false,
});

const mockRound = (
  currentVotingRound: CurrentVotingRoundQuery['currentVotingRound'],
  me: CurrentVotingRoundQuery['me'] = { id: 'user-1' }
) =>
  mswServer.use(
    mockGraphqlQuery<CurrentVotingRoundQuery>({
      queryName: GQL_OPERATION_CURRENT_ROUND,
      data: { me, currentVotingRound },
    })
  );

const renderList = () =>
  testRender(
    <FeatureVotingList
      serviceInstanceId="instance-1"
      roadmapHref={ROADMAP_HREF}
    />
  );

describe('FeatureVotingList', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(usePathname).mockReturnValue('/en/feature-voting');
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
      toString: vi.fn().mockReturnValue(''),
    } as unknown as ReturnType<typeof useSearchParams>);
  });

  it('should group the features of the open round by product', async () => {
    // Given
    mockRound(
      mockVotingRound({
        id: 'round-1',
        name: 'Feature vote #1',
        description: 'Tell us what matters to you',
        features: [openctiFeature, openaevFeature],
      })
    );

    // When
    renderList();

    // Then
    expect(
      await screen.findByText('Tell us what matters to you')
    ).toBeInTheDocument();
    expect(screen.getByText('AI-powered report triage')).toBeInTheDocument();
    expect(screen.getByText('Scenario library')).toBeInTheDocument();
    // One reminder per product section that carries features.
    expect(screen.getAllByText('FeatureVoting.OneVotePerProduct')).toHaveLength(
      2
    );
  });

  // The page is reachable even between two rounds, it must stay readable.
  it('should explain that no round is collecting votes when there is none', async () => {
    // Given
    mockRound(null);

    // When
    renderList();

    // Then
    expect(
      await screen.findByText('FeatureVoting.NoOpenRound')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('FeatureVoting.OneVotePerProduct')
    ).not.toBeInTheDocument();
  });

  it('should let an anonymous visitor see the features', async () => {
    // Given
    mockRound(
      mockVotingRound({
        id: 'round-1',
        description: null,
        features: [openctiFeature],
      }),
      null
    );

    // When
    renderList();

    // Then
    expect(
      await screen.findByText('AI-powered report triage')
    ).toBeInTheDocument();
    expect(screen.getByText('FeatureVoting.Description')).toBeInTheDocument();
  });

  it('should link back to the roadmap the round belongs to', async () => {
    // Given
    mockRound(
      mockVotingRound({
        id: 'round-1',
        description: 'Tell us what matters to you',
        features: [openctiFeature],
      })
    );

    // When
    renderList();

    // Then
    expect(
      await screen.findByRole('link', { name: 'Epic.XTMRoadmap' })
    ).toHaveAttribute('href', ROADMAP_HREF);
  });
});
