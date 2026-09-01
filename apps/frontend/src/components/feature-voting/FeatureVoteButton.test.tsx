import { FeatureVoteButton } from '@/components/feature-voting/FeatureVoteButton';
import { mockGraphqlMutation } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { FeatureVoteMutation } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';

const GQL_OPERATION_FEATURE_VOTE = 'FeatureVote';

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock('@filigran/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@filigran/ui')>()),
  toast: toastMock,
}));

const mockVoteSuccess = () =>
  mswServer.use(
    mockGraphqlMutation<FeatureVoteMutation>({
      queryName: GQL_OPERATION_FEATURE_VOTE,
      data: { voteForFeature: { id: 'feature-1', has_my_vote: true } },
    })
  );

const mockVoteError = (message: string) =>
  mswServer.use(
    mockGraphqlMutation({
      queryName: GQL_OPERATION_FEATURE_VOTE,
      errors: [{ message }],
    })
  );

describe('FeatureVoteButton', () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(usePathname).mockReturnValue('/en/feature-voting');
  });

  // An anonymous visitor must be sent to sign up rather than silently failing.
  it('should redirect to sign up instead of voting when not authenticated', async () => {
    // Given
    const { user } = testRender(
      <FeatureVoteButton
        featureId="feature-1"
        hasMyVote={false}
        isAuthenticated={false}
      />
    );

    // When
    await user.click(
      screen.getByRole('button', { name: 'FeatureVoting.Vote' })
    );

    // Then
    expect(push).toHaveBeenCalledWith(
      `/sign-up?redirect=${btoa('/en/feature-voting')}`
    );
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('should confirm with a toast when the vote is recorded', async () => {
    // Given
    mockVoteSuccess();
    const { user } = testRender(
      <FeatureVoteButton
        featureId="feature-1"
        hasMyVote={false}
        isAuthenticated
      />
    );

    // When
    await user.click(
      screen.getByRole('button', { name: 'FeatureVoting.Vote' })
    );

    // Then
    await vi.waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'FeatureVoting.VoteRecordedTitle' })
      )
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('should surface the server error code when the vote is rejected', async () => {
    // Given
    mockVoteError('VOTING_ROUND_NOT_OPEN');
    const { user } = testRender(
      <FeatureVoteButton
        featureId="feature-1"
        hasMyVote={false}
        isAuthenticated
      />
    );

    // When
    await user.click(
      screen.getByRole('button', { name: 'FeatureVoting.Vote' })
    );

    // Then
    await vi.waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      )
    );
  });

  it('should disable the button and show the voted state when the feature already has my vote', () => {
    // Given / When
    testRender(
      <FeatureVoteButton
        featureId="feature-1"
        hasMyVote
        isAuthenticated
      />
    );

    // Then
    expect(
      screen.getByRole('button', { name: /FeatureVoting.Voted/ })
    ).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'FeatureVoting.Vote' })
    ).not.toBeInTheDocument();
  });
});
