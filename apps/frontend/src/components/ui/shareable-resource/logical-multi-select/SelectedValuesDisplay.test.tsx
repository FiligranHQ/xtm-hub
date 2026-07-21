import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SelectedValuesDisplay } from './SelectedValuesDisplay';

vi.mock('@filigran/icon', () => ({
  CancelIcon: () => <svg data-testid="cancel-icon" />,
}));

vi.mock('@filigran/ui/clients', () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <div role="tooltip">{children}</div>
  ),
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
    await user.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders selected values + tooltip branch', () => {
    testRender(
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

    expect(screen.getAllByText('Type =').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Child 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Parent 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Utils.Or').length).toBeGreaterThan(0);
  });
});
