import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  isLogicalMultiSelectSelection,
  LogicalMultiSelectFormField,
} from './LogicalMultiSelectFormField';

describe('LogicalMultiSelectFormField', () => {
  it('validates selection objects', () => {
    expect(isLogicalMultiSelectSelection({ a: ['x'] })).toBe(true);
    expect(isLogicalMultiSelectSelection({ a: [1] })).toBe(false);
    expect(isLogicalMultiSelectSelection(null)).toBe(false);
    expect(isLogicalMultiSelectSelection(['x'])).toBe(false);
  });

  it('applies parent/child toggle semantics and clear behavior', async () => {
    const onValueChange = vi.fn();
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
      />
    );

    // Open the popover
    await user.click(screen.getByText('placeholder'));
    const listbox = screen.getByRole('listbox');

    // Select child A1
    await user.click(within(listbox).getByText('A1'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: ['a1'] });

    // Select A2 — all children selected → parent fully selected
    await user.click(within(listbox).getByText('A2'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: [] });

    // Deselect A1 — partial selection (A2 only)
    await user.click(within(listbox).getByText('A1'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: ['a2'] });

    // Clear all (Utils.Clear visible because there is a selection)
    await user.click(within(listbox).getByText('Utils.Clear'));
    expect(onValueChange).toHaveBeenLastCalledWith({});

    // Toggle parent on (select all children)
    await user.click(within(listbox).getByText('Parent A'));
    expect(onValueChange).toHaveBeenLastCalledWith({ a: [] });

    // Toggle parent off (deselect)
    await user.click(within(listbox).getByText('Parent A'));
    expect(onValueChange).toHaveBeenLastCalledWith({});
  });
});
