import { EpicItemCard } from '@/components/epic/epic-item/epic-item-card';
import testRender from '@/utils/test/test-render';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const useEpicListContextMock = vi.fn();

vi.mock('@/hooks/useEpicListContext', () => ({
  useEpicListContext: () => useEpicListContextMock(),
}));

describe('EpicItemCard', () => {
  const epic = {
    id: 'epic-1',
    title: 'Roadmap epic',
    epic_type: EpicTypeEnum.OTHER,
    product: FiligranProductEnum.OPENCTI,
    short_description: 'short description',
    description: 'long description',
  } as epic_fragment$data;

  beforeEach(() => {
    vi.clearAllMocks();
    useEpicListContextMock.mockReturnValue({
      connectionID: 'connection-id-1',
      filterByProduct: vi.fn(),
    });
  });

  it('renders card content and child components', () => {
    // Given
    const environment = createMockEnvironment();

    // When
    testRender(
      <EpicItemCard
        epic={epic}
        serviceInstanceId={'service-instance-1'}
        setIsOpen={vi.fn()}
        userCanDelete={false}
        userCanUpdate={false}
      />,
      { relayConfig: environment }
    );

    // Then
    expect(
      screen.getByRole('heading', { name: epic.title })
    ).toBeInTheDocument();
    expect(screen.getByText(epic.short_description)).toBeInTheDocument();
  });

  it('opens details when clicking outside admin menu area', async () => {
    // Given
    const environment = createMockEnvironment();
    const setIsOpen = vi.fn();

    const { user } = testRender(
      <EpicItemCard
        epic={epic}
        serviceInstanceId={'service-instance-1'}
        setIsOpen={setIsOpen}
        userCanDelete={false}
        userCanUpdate={false}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(screen.getByText(epic.title));

    // Then
    expect(setIsOpen).toHaveBeenCalledOnce();
    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it('does not open details when clicking in admin menu area', async () => {
    // Given
    const environment = createMockEnvironment();
    const setIsOpen = vi.fn();

    const { user } = testRender(
      <EpicItemCard
        epic={epic}
        serviceInstanceId={'service-instance-1'}
        setIsOpen={setIsOpen}
        userCanDelete={true}
        userCanUpdate={true}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    // Then
    expect(setIsOpen).not.toHaveBeenCalled();
  });
});
