import AddVotableFeature from '@/components/admin/voting-round/AddVotableFeature';
import { mockGraphqlMutation } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { VotableFeatureCreateMutation } from '@graphql/generated';
import { mockVotableFeature } from '@graphql/mocks';
import { screen, waitFor } from '@testing-library/react';

const GQL_OPERATION_VOTABLE_FEATURE_CREATE = 'VotableFeatureCreate';

const fillForm = async (user: ReturnType<typeof testRender>['user']) => {
  await user.click(
    screen.getByRole('button', { name: 'VotingRound.Feature.Actions.Add' })
  );
  await user.type(
    screen.getByLabelText(/VotingRound.Feature.Title/i),
    'AI-powered report triage'
  );
  await user.type(
    screen.getByLabelText(/VotingRound.Feature.ShortDescription/i),
    'Extract entities automatically.'
  );
  await user.type(
    screen.getByPlaceholderText('VotingRound.Feature.DescriptionPlaceholder'),
    'Leverage AI to ingest unstructured threat reports.'
  );
  await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));
};

describe('AddVotableFeature', () => {
  it('should open the sheet from its trigger', async () => {
    const { user } = testRender(<AddVotableFeature roundId="round-1" />);

    await user.click(
      screen.getByRole('button', { name: 'VotingRound.Feature.Actions.Add' })
    );

    expect(
      screen.getByLabelText(/VotingRound.Feature.Title/i)
    ).toBeInTheDocument();
  });

  it('should close the sheet once the feature is created', async () => {
    const response: VotableFeatureCreateMutation = {
      createVotableFeature: mockVotableFeature({ id: 'feature-1' }),
    };
    mswServer.use(
      mockGraphqlMutation({
        queryName: GQL_OPERATION_VOTABLE_FEATURE_CREATE,
        data: response,
      })
    );

    const { user } = testRender(<AddVotableFeature roundId="round-1" />);
    await fillForm(user);

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/VotingRound.Feature.Title/i)
      ).not.toBeInTheDocument();
    });
  });

  // Losing the sheet on failure would discard everything the admin typed, so
  // the form has to survive a rejected mutation.
  it('should keep the sheet open when the mutation fails', async () => {
    mswServer.use(
      mockGraphqlMutation({
        queryName: GQL_OPERATION_VOTABLE_FEATURE_CREATE,
        errors: [{ message: 'VOTABLE_FEATURE_MUTATION_ERROR' }],
      })
    );

    const { user } = testRender(<AddVotableFeature roundId="round-1" />);
    await fillForm(user);

    expect(
      await screen.findByLabelText(/VotingRound.Feature.Title/i)
    ).toBeInTheDocument();
  });
});
