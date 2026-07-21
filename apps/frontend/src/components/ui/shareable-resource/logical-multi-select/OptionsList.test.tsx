import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OptionsList } from './OptionsList';

vi.mock('@filigran/ui', () => ({
  CommandEmpty: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CommandGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
  }: {
    children: ReactNode;
    onSelect?: () => void;
  }) => <button onClick={onSelect}>{children}</button>,
  CommandSeparator: () => <hr />,
  Separator: () => <span>|</span>,
  Checkbox: ({ checked }: { checked: boolean | 'indeterminate' }) => (
    <span data-testid="checkbox-state">{String(checked)}</span>
  ),
}));

describe('OptionsList', () => {
  it('renders parent/child options and triggers toggle handlers', async () => {
    const toggleParent = vi.fn();
    const toggleChild = vi.fn();
    const onClear = vi.fn();
    const onClose = vi.fn();
    const { user } = testRender(
      <OptionsList
        flatOptions={[
          { type: 'parent', value: 'parent-a', label: 'Parent A' },
          {
            type: 'child',
            value: 'child-a1',
            label: 'Child A1',
            parentValue: 'parent-a',
          },
        ]}
        noResultString="nothing"
        isParentFullySelected={() => false}
        isParentPartiallySelected={() => true}
        isChildSelected={() => true}
        toggleParent={toggleParent}
        toggleChild={toggleChild}
        onClear={onClear}
        onClose={onClose}
        showClear
      />
    );

    expect(screen.getByText('nothing')).toBeInTheDocument();
    expect(screen.getAllByTestId('checkbox-state')).toHaveLength(2);
    expect(screen.getAllByTestId('checkbox-state')[0]).toHaveTextContent(
      'indeterminate'
    );
    expect(screen.getAllByTestId('checkbox-state')[1]).toHaveTextContent(
      'true'
    );

    await user.click(screen.getByText('Parent A'));
    expect(toggleParent).toHaveBeenCalledWith('parent-a');
    await user.click(screen.getByText('Child A1'));
    expect(toggleChild).toHaveBeenCalledWith('child-a1', 'parent-a');
    await user.click(screen.getByText('Utils.Clear'));
    expect(onClear).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText('Utils.Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides clear action when showClear is false', () => {
    testRender(
      <OptionsList
        flatOptions={[]}
        noResultString="nothing"
        isParentFullySelected={() => false}
        isParentPartiallySelected={() => false}
        isChildSelected={() => false}
        toggleParent={vi.fn()}
        toggleChild={vi.fn()}
        onClear={vi.fn()}
        onClose={vi.fn()}
        showClear={false}
      />
    );

    expect(screen.queryByText('Utils.Clear')).not.toBeInTheDocument();
    expect(screen.getByText('Utils.Close')).toBeInTheDocument();
  });
});
