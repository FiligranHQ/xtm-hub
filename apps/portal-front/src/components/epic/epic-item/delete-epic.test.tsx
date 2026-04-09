import { DeleteEpic } from '@/components/epic/epic-item/delete-epic';
import testRender from '@/utils/test/test-render';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';
const commitDeleteEpicMutationMock = vi.fn();
vi.mock('react-relay', async () => {
  const actual =
    await vi.importActual<typeof import('react-relay')>('react-relay');
  return {
    ...actual,
    useMutation: () => [commitDeleteEpicMutationMock],
  };
});

describe('DeleteEpic', () => {
  const epic = {
    id: 'epic-1',
    title: 'Roadmap',
  } as epic_fragment$data;

  it('close dialog when user clicks on cancel', async () => {
    // Given
    const environment = createMockEnvironment();

    const setOpen = vi.fn();
    const { user } = testRender(
      <DeleteEpic
        epic={epic}
        connectionId={'epic-connection-id'}
        open={true}
        setOpen={setOpen}
      />,
      { relayConfig: environment }
    );
    // When
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Then
    expect(setOpen).toHaveBeenCalledOnce();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('commits deletion and shows success toast on completion', async () => {
    // Given

    const environment = createMockEnvironment();
    const setOpen = vi.fn();

    const { user } = testRender(
      <DeleteEpic
        epic={epic}
        connectionId={'epic-connection-id'}
        open={true}
        setOpen={setOpen}
      />,
      { relayConfig: environment }
    );

    // When
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Then
    expect(commitDeleteEpicMutationMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        variables: {
          connections: ['epic-connection-id'],
          id: epic.id,
        },
      })
    );
    expect(setOpen).toHaveBeenCalledOnce();
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
