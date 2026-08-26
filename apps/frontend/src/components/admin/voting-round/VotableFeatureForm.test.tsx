import VotableFeatureForm from '@/components/admin/voting-round/VotableFeatureForm';
import testRender from '@/utils/test/test-render';
import { FiligranProduct } from '@graphql/generated';
import { screen, waitFor } from '@testing-library/react';

const buildFeature = () => ({
  id: 'feature-1',
  title: 'AI-powered report triage',
  short_description: 'Automatically extract entities.',
  description: 'Long **markdown** description',
  product: FiligranProduct.Opencti,
  labels: ['AI', 'Import'],
  image_url: '/images/triage.png',
  position: 2,
  active: true,
});

describe('VotableFeatureForm', () => {
  describe('form validation', () => {
    it('should reject an absolute image URL, which the CSP and next/image would block', async () => {
      const handleSubmit = vi.fn();
      const { user } = testRender(
        <VotableFeatureForm
          onClose={vi.fn()}
          handleSubmit={handleSubmit}
        />
      );

      await user.type(
        screen.getByLabelText(/VotingRound.Feature.Title/i),
        'New feature'
      );
      await user.type(
        screen.getByLabelText(/VotingRound.Feature.ShortDescription/i),
        'Short'
      );
      await user.type(
        screen.getByLabelText(/VotingRound.Feature.ImageUrl/i),
        'https://example.com/image.png'
      );
      await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
      expect(
        await screen.findByText('VotingRound.Feature.Error.ImageUrl')
      ).toBeInTheDocument();
    });
  });

  describe('image field', () => {
    it('should preview the current image and clear it from the remove button', async () => {
      const { user } = testRender(
        <VotableFeatureForm
          feature={buildFeature()}
          onClose={vi.fn()}
          handleDelete={vi.fn()}
          handleSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByDisplayValue('/images/triage.png')
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', {
          name: 'VotingRound.Feature.RemoveImage',
        })
      );

      expect(
        screen.queryByDisplayValue('/images/triage.png')
      ).not.toBeInTheDocument();
    });

    it('should not show the remove button when there is no image', () => {
      testRender(
        <VotableFeatureForm
          onClose={vi.fn()}
          handleSubmit={vi.fn()}
        />
      );

      expect(
        screen.queryByRole('button', {
          name: 'VotingRound.Feature.RemoveImage',
        })
      ).not.toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should prefill the edited feature values', () => {
      testRender(
        <VotableFeatureForm
          feature={buildFeature()}
          onClose={vi.fn()}
          handleDelete={vi.fn()}
          handleSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByDisplayValue('AI-powered report triage')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('AI, Import')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByLabelText('VotingRound.Feature.Active')).toBeChecked();
    });

    it('should call onClose when cancelling', async () => {
      const onClose = vi.fn();
      const { user } = testRender(
        <VotableFeatureForm
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
        <VotableFeatureForm
          feature={buildFeature()}
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
  });
});
