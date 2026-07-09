import { EpicItemDetailed } from '@/components/epic/epic-item/EpicItemDetailed';
import testRender from '@/utils/test/test-render';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EditionType, EpicType, FiligranProduct } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EpicItemDetailed', () => {
  const epic = (product: FiligranProduct) =>
    ({
      id: 'epic-1',
      title: 'Roadmap epic',
      epic_type: EpicType.Other,
      edition_type: EditionType.CommunityEdition,
      product,
      short_description: 'short description',
      description: 'long **description**',
      document_id: null,
      active: true,
      timeline: 'now',
    }) as epic_fragment$data;

  const defaultProps = {
    epic: epic(FiligranProduct.Opencti),
    serviceInstanceId: 'service-instance-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, markdown description and footer', () => {
    // Given
    const environment = createMockEnvironment();

    // When
    testRender(<EpicItemDetailed {...defaultProps} />, {
      relayConfig: environment,
    });

    // Then
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(defaultProps.epic.title);
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it.each`
    product                    | expectedLink
    ${FiligranProduct.Opencti} | ${'https://filigran-community.slack.com/archives/CHZC2D38C'}
    ${FiligranProduct.Openaev} | ${'https://filigran-community.slack.com/archives/CJ1PHBHF1'}
    ${FiligranProduct.Xtmone}  | ${'https://filigran-community.slack.com/archives/CHNEM9NUT'}
    ${FiligranProduct.Xtmhub}  | ${'https://filigran-community.slack.com/archives/C08HU35NPD4'}
  `(
    'renders community call-to-action for $product',
    ({ product, expectedLink }) => {
      // Given
      const environment = createMockEnvironment();

      // When
      testRender(
        <EpicItemDetailed
          {...defaultProps}
          epic={epic(product)}
        />,
        {
          relayConfig: environment,
        }
      );

      // Then
      const communityLink = screen.getByRole('link', {
        name: 'Epic.JoinCommunity',
      });

      expect(communityLink).toHaveAttribute('href', expectedLink);
      expect(communityLink).toHaveAttribute('target', '_blank');
      expect(communityLink).toHaveAttribute('rel', 'noopener noreferrer');
    }
  );
});
