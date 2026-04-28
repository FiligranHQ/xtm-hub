import testRender from '@/utils/test/test-render';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { screen, within } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EpicItem } from './EpicItem';

const useEpicListContextMock = vi.fn();

vi.mock('@/hooks/use-epic-list-context', () => ({
  useEpicListContext: () => useEpicListContextMock(),
}));

describe('EpicItem', () => {
  const epic = {
    id: 'epic-1',
    title: 'Roadmap epic',
    epic_type: EpicTypeEnum.OTHER,
    product: FiligranProductEnum.OPENCTI,
    short_description: 'short description',
    description: 'long description',
  } as epic_fragment$data;

  const defaultProps = {
    epic,
    serviceInstanceId: 'service-instance-1',
    userCanDelete: false,
    userCanUpdate: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useEpicListContextMock.mockReturnValue({
      connectionID: 'connection-id-1',
      filterByProduct: vi.fn(),
    });
  });

  it('renders card and passes expected props', () => {
    // Given
    const environment = createMockEnvironment();

    // When
    const { queryByText } = testRender(<EpicItem {...defaultProps} />, {
      relayConfig: environment,
    });

    // Then
    expect(queryByText(epic.title)).toBeInTheDocument();
    expect(queryByText(epic.short_description)).toBeInTheDocument();
    expect(queryByText(epic.description)).not.toBeInTheDocument();
  });

  it('opens detail dialog when card asks to open it', async () => {
    // Given
    const environment = createMockEnvironment();
    const { user } = testRender(<EpicItem {...defaultProps} />, {
      relayConfig: environment,
    });

    // When
    const card = screen.getByRole('listitem');
    await user.click(within(card).getByText(epic.title));

    // Then
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(epic.description)).toBeInTheDocument();
    expect(
      within(dialog).queryByText(epic.short_description)
    ).not.toBeInTheDocument();

    expect(within(card).getByText(epic.title)).toBeInTheDocument();
  });

  it('closes detail dialog when dialog emits close event', async () => {
    // Given
    const environment = createMockEnvironment();
    const { user, queryByText } = testRender(<EpicItem {...defaultProps} />, {
      relayConfig: environment,
    });

    const card = screen.getByRole('listitem');
    await user.click(within(card).getByText(epic.title));

    // When
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Then
    expect(queryByText(epic.title)).toBeInTheDocument();
    expect(queryByText(epic.short_description)).toBeInTheDocument();
    expect(queryByText(epic.description)).not.toBeInTheDocument();
  });
});
