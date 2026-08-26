import { FeatureVotingItem } from '@/components/feature-voting/FeatureVotingItem';
import testRender from '@/utils/test/test-render';
import { featureVoting_fragment$data } from '@generated/featureVoting_fragment.graphql';
import { screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const feature = {
  id: 'feature-1',
  title: 'AI-powered report triage',
  short_description: 'Automatically extract entities from reports.',
  description: 'Long description of the feature',
  product: 'opencti',
  labels: ['AI'],
  image_url: null,
  position: 1,
  has_my_vote: false,
} as unknown as featureVoting_fragment$data;

describe('FeatureVotingItem', () => {
  const replace = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace,
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

  it('should put the feature id in the URL when clicking the card', async () => {
    const { user } = testRender(
      <FeatureVotingItem
        feature={feature}
        isAuthenticated
      />
    );

    await user.click(screen.getByText('AI-powered report triage'));

    expect(replace).toHaveBeenCalledWith(
      '/en/feature-voting?featureId=feature-1',
      { scroll: false }
    );
  });

  // Voting is the primary action of the card: it must not be hijacked by the
  // detail dialog.
  it('should not open the detail when clicking the vote button', async () => {
    const { user } = testRender(
      <FeatureVotingItem
        feature={feature}
        isAuthenticated
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'FeatureVoting.Vote' })
    );

    expect(replace).not.toHaveBeenCalled();
  });

  it('should render the detail and its long description when the URL selects the feature', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('feature-1'),
      toString: vi.fn().mockReturnValue('featureId=feature-1'),
    } as unknown as ReturnType<typeof useSearchParams>);

    testRender(
      <FeatureVotingItem
        feature={feature}
        isAuthenticated
      />
    );

    expect(
      screen.getByRole('heading', { name: 'AI-powered report triage' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Long description of the feature')
    ).toBeInTheDocument();
  });

  it('should drop the feature id from the URL when closing the detail', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('feature-1'),
      toString: vi.fn().mockReturnValue('featureId=feature-1'),
    } as unknown as ReturnType<typeof useSearchParams>);

    const { user } = testRender(
      <FeatureVotingItem
        feature={feature}
        isAuthenticated
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(replace).toHaveBeenCalledWith('/en/feature-voting', {
      scroll: false,
    });
  });
});
