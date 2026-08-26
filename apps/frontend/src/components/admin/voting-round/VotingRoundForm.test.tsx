import VotingRoundForm from '@/components/admin/voting-round/VotingRoundForm';
import testRender from '@/utils/test/test-render';
import { screen, waitFor } from '@testing-library/react';

describe('VotingRoundForm', () => {
  describe('form validation', () => {
    it('should not submit when the name is too short', async () => {
      const handleSubmit = vi.fn();
      const { user } = testRender(
        <VotingRoundForm
          onClose={vi.fn()}
          handleSubmit={handleSubmit}
        />
      );

      await user.type(screen.getByLabelText(/VotingRound.Form.Name/i), 'a');
      await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });

    it('should submit the name and description', async () => {
      const handleSubmit = vi.fn();
      const { user } = testRender(
        <VotingRoundForm
          onClose={vi.fn()}
          handleSubmit={handleSubmit}
        />
      );

      await user.type(
        screen.getByLabelText(/VotingRound.Form.Name/i),
        'Feature vote #2'
      );
      await user.type(
        screen.getByLabelText(/VotingRound.Form.Description/i),
        'Second round'
      );
      await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Feature vote #2',
            description: 'Second round',
          }),
          expect.anything()
        );
      });
    });
  });

  describe('actions', () => {
    it('should prefill the values of the edited round', () => {
      testRender(
        <VotingRoundForm
          votingRound={{
            id: 'round-1',
            name: 'Feature vote #1',
            description: 'First round',
          }}
          onClose={vi.fn()}
          handleDelete={vi.fn()}
          handleSubmit={vi.fn()}
        />
      );

      expect(screen.getByDisplayValue('Feature vote #1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('First round')).toBeInTheDocument();
    });

    it('should call onClose when cancelling', async () => {
      const onClose = vi.fn();
      const { user } = testRender(
        <VotingRoundForm
          onClose={onClose}
          handleSubmit={vi.fn()}
        />
      );

      await user.click(screen.getByRole('button', { name: /Utils.Cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call handleDelete after confirming the deletion', async () => {
      const handleDelete = vi.fn();
      const { user } = testRender(
        <VotingRoundForm
          votingRound={{ id: 'round-1', name: 'Feature vote #1' }}
          onClose={vi.fn()}
          handleDelete={handleDelete}
          handleSubmit={vi.fn()}
        />
      );

      await user.click(
        screen.getByRole('button', { name: /^MenuActions.Delete$/i })
      );
      await user.click(
        screen.getByRole('button', { name: /^MenuActions.Delete$/i })
      );

      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('should not offer the copy-features field when editing an existing round', () => {
      testRender(
        <VotingRoundForm
          votingRound={{ id: 'round-1', name: 'Feature vote #1' }}
          copySources={[{ id: 'round-0', name: 'Feature vote #0' }]}
          onClose={vi.fn()}
          handleDelete={vi.fn()}
          handleSubmit={vi.fn()}
        />
      );

      expect(
        screen.queryByLabelText(/VotingRound.Form.CopyFeaturesFrom/i)
      ).not.toBeInTheDocument();
    });
  });
});
