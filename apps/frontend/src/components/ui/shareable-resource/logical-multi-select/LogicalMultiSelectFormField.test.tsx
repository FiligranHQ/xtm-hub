import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  isLogicalMultiSelectSelection,
  LogicalMultiSelectFormField,
} from './LogicalMultiSelectFormField';

const optionsListPropsMock = vi.fn();
const selectedValuesDisplayPropsMock = vi.fn();

vi.mock('@filigran/ui', () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  Command: ({
    children,
    onChange,
  }: {
    children: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      <button
        onClick={() =>
          onChange?.({
            target: { value: 'search' },
          } as ChangeEvent<HTMLInputElement>)
        }>
        command-change
      </button>
      {children}
    </div>
  ),
  CommandInput: ({
    onKeyDown,
  }: {
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  }) => (
    <input
      aria-label="command-input"
      onKeyDown={(event) => onKeyDown?.(event)}
    />
  ),
  CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@filigran/ui/servers', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock(
  '@/components/ui/shareable-resource/logical-multi-select/SelectedValuesDisplay',
  () => ({
    SelectedValuesDisplay: (props: {
      groupedSelections: Array<{ parentValue: string; children: string[] }>;
      onRemove?: () => void;
    }) => {
      selectedValuesDisplayPropsMock(props);
      const { groupedSelections, onRemove } = props;
      return (
        <div>
          <div data-testid="groups-count">{groupedSelections.length}</div>
          <button onClick={onRemove}>remove-filter</button>
        </div>
      );
    },
  })
);

vi.mock(
  '@/components/ui/shareable-resource/logical-multi-select/OptionsList',
  () => ({
    OptionsList: (props: {
      toggleParent: (parentValue: string) => void;
      toggleChild: (childValue: string, parentValue: string) => void;
      onClear: () => void;
      onClose: () => void;
      showClear: boolean;
    }) => {
      optionsListPropsMock(props);
      const { showClear, toggleChild, toggleParent, onClear, onClose } = props;
      return (
        <div>
          <div data-testid="show-clear">{String(showClear)}</div>
          <button onClick={() => toggleParent('a')}>toggle-parent-a</button>
          <button onClick={() => toggleChild('a1', 'a')}>
            toggle-child-a1
          </button>
          <button onClick={() => toggleChild('a2', 'a')}>
            toggle-child-a2
          </button>
          <button onClick={onClear}>clear-all</button>
          <button onClick={onClose}>close</button>
        </div>
      );
    },
  })
);

describe('LogicalMultiSelectFormField', () => {
  it('validates selection objects', () => {
    expect(isLogicalMultiSelectSelection({ a: ['x'] })).toBe(true);
    expect(isLogicalMultiSelectSelection({ a: [1] })).toBe(false);
    expect(isLogicalMultiSelectSelection(null)).toBe(false);
    expect(isLogicalMultiSelectSelection(['x'])).toBe(false);
  });

  it('applies parent/child toggle semantics and clear behavior', async () => {
    const onValueChange = vi.fn();
    const onInputChange = vi.fn();
    const onRemove = vi.fn();
    const { user } = testRender(
      <LogicalMultiSelectFormField
        options={[
          {
            label: 'Parent A',
            value: 'a',
            children: [
              { label: 'A1', value: 'a1' },
              { label: 'A2', value: 'a2' },
            ],
          },
        ]}
        initialValue={{}}
        placeholder="placeholder"
        noResultString="no-result"
        optionLabel="label"
        onValueChange={onValueChange}
        onInputChange={onInputChange}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByText('toggle-child-a1'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: ['a1'] });

    await user.click(screen.getByText('toggle-child-a2'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: [] });

    await user.click(screen.getByText('toggle-child-a1'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: ['a2'] });

    await user.click(screen.getByText('toggle-parent-a'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: [] });

    await user.click(screen.getByText('toggle-parent-a'));
    expect(onValueChange).toHaveBeenLastCalledWith({});

    await user.click(screen.getByText('clear-all'));
    expect(onValueChange).toHaveBeenLastCalledWith({});

    await user.click(screen.getByText('command-change'));
    expect(onInputChange).toHaveBeenCalledWith('search');

    await user.click(screen.getByText('remove-filter'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
