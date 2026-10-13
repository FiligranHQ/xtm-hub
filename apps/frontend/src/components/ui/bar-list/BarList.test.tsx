import { BarList } from '@/components/ui/bar-list';
import { BarListMeta } from '@/components/ui/bar-list/BarList.meta';
import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';

const ITEMS = [
  { key: 'finance', label: 'Finance', value: 120, detail: '(6 platforms)' },
  { key: 'energy', label: 'Energy', value: 30 },
];

describe('BarList', () => {
  it('should print every label and value, in the given order', () => {
    // When
    testRender(
      <BarList
        aria-label="Events by sector"
        items={ITEMS}
        formatValue={(value) => `${value} events`}
      />
    );

    // Then
    const list = screen.getByRole('list', { name: 'Events by sector' });
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Finance120 events (6 platforms)', 'Energy30 events']);
  });

  it('should scale the bars against the largest value and name them by their label', () => {
    // When
    testRender(
      <BarList
        aria-label="Events by sector"
        items={ITEMS}
      />
    );

    // Then
    expect(
      screen.getByRole('progressbar', { name: 'Finance' })
    ).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('progressbar', { name: 'Energy' })).toHaveAttribute(
      'aria-valuenow',
      '25'
    );
  });

  it('should show the empty label when there is nothing to list', () => {
    // When
    testRender(
      <BarList
        aria-label="Events by sector"
        items={[]}
        emptyLabel="No contribution yet"
      />
    );

    // Then
    expect(screen.getByText('No contribution yet')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should describe itself as a data display component', () => {
    // Then
    expect(BarListMeta).toMatchObject({
      name: 'BarList',
      category: 'data-display',
    });
    expect(Object.keys(BarListMeta.props)).toEqual(
      expect.arrayContaining(['items', 'aria-label'])
    );
  });
});
