import { EpicItemDetailed } from '@/components/epic/epic-item/epic-item-detailed';
import testRender from '@/utils/test/test-render';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it } from 'vitest';

describe('EpicItemDetailed', () => {
  const epic = {
    id: 'epic-1',
    title: 'Roadmap epic',
    epic_type: EpicTypeEnum.OTHER,
    product: FiligranProductEnum.OPENCTI,
    short_description: 'short description',
    description: 'long description',
    document_id: null,
    active: true,
    timeline: 'now',
  } as epic_fragment$data;

  const defaultProps = {
    epic,
    serviceInstanceId: 'service-instance-1',
  };

  it('Should render title, long description and product name only', () => {
    // Given
    const environment = createMockEnvironment();

    // When
    const { queryByText } = testRender(<EpicItemDetailed {...defaultProps} />, {
      relayConfig: environment,
    });

    // Then
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(epic.title);
    expect(screen.getByText(epic.description)).toBeInTheDocument();
    expect(screen.getByText('OpenCTI')).toBeInTheDocument();
    expect(queryByText(epic.short_description)).not.toBeInTheDocument();
    expect(queryByText('integration')).not.toBeInTheDocument();
  });

  it('renders integration badge when epic_type is INTEGRATION and document_id is set', () => {
    // Given
    const integrationEpic = {
      ...epic,
      epic_type: EpicTypeEnum.INTEGRATION,
      document_id: 'doc-1',
    } as epic_fragment$data;
    const environment = createMockEnvironment();

    // When
    testRender(
      <EpicItemDetailed
        {...defaultProps}
        epic={integrationEpic}
      />,
      { relayConfig: environment }
    );

    // Then
    expect(screen.getByText('integration')).toBeInTheDocument();
  });
});
