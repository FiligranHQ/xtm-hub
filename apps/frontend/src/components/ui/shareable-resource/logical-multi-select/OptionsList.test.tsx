import testRender from '@/utils/test/test-render';
import { Command, CommandList } from '@filigran/ui';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OptionsList } from './OptionsList';

describe('OptionsList', () => {
  it('renders parent/child options and triggers toggle handlers', async () => {
    const toggleParent = vi.fn();
    const toggleChild = vi.fn();
    const onClear = vi.fn();
    const onClose = vi.fn();
    const { user } = testRender(
      <Command>
        <CommandList>
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
        </CommandList>
      </Command>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toHaveAttribute('data-state', 'indeterminate');
    expect(checkboxes[1]).toHaveAttribute('data-state', 'checked');

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
      <Command>
        <CommandList>
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
        </CommandList>
      </Command>
    );

    expect(screen.queryByText('Utils.Clear')).not.toBeInTheDocument();
    expect(screen.getByText('Utils.Close')).toBeInTheDocument();
  });
});
