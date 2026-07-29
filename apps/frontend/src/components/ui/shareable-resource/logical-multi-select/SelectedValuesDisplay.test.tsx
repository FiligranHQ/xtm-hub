import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SelectedValuesDisplay } from './SelectedValuesDisplay';

describe('SelectedValuesDisplay', () => {
  it('renders placeholder + remove button when no selection', async () => {
    const onRemove = vi.fn();
    const { user } = testRender(
      <SelectedValuesDisplay
        groupedSelections={[]}
        optionLabel="Type"
        placeholder="Choose values"
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Choose values')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove filter' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders selected values in the selection chip', () => {
    const { container } = testRender(
      <SelectedValuesDisplay
        groupedSelections={[
          {
            parentValue: 'p1',
            parentLabel: 'Parent 1',
            children: [{ value: 'c1', label: 'Child 1' }],
          },
          { parentValue: 'p2', parentLabel: 'Parent 2', children: [] },
        ]}
        optionLabel="Type"
        placeholder="Choose values"
      />
    );

    // "Type =" is rendered in a FilterLabel span — exact element match
    expect(screen.getByText('Type =')).toBeInTheDocument();
    // "Utils.Or" is rendered in an OrSeparator span — exact element match
    expect(screen.getByText('Utils.Or')).toBeInTheDocument();
    // Child labels and parent labels are bare text nodes; check via container
    const chip = container.querySelector('[class*="truncate"]');
    expect(chip).toHaveTextContent('Child 1');
    expect(chip).toHaveTextContent('Parent 2');
  });
});
