import { ColumnChart } from '@/components/ui/column-chart';
import { ColumnChartMeta } from '@/components/ui/column-chart/ColumnChart.meta';
import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';

const DATA = [
  { key: '2026-10-01', label: 'Oct 1', value: 0 },
  { key: '2026-10-02', label: 'Oct 2', value: 50 },
  { key: '2026-10-03', label: 'Oct 3', value: 200 },
];

describe('ColumnChart', () => {
  it('should name every column with its label and formatted value', () => {
    // When
    testRender(
      <ColumnChart
        aria-label="Records per day"
        data={DATA}
        formatValue={(value) => `${value} records`}
      />
    );

    // Then
    const chart = screen.getByRole('figure', { name: 'Records per day' });
    expect(
      within(chart)
        .getAllByRole('listitem')
        .map((column) => column.getAttribute('aria-label'))
    ).toEqual(['Oct 1: 0 records', 'Oct 2: 50 records', 'Oct 3: 200 records']);
  });

  it('should scale the columns against the largest value', () => {
    // When
    testRender(
      <ColumnChart
        aria-label="Records per day"
        data={DATA}
      />
    );

    // Then
    expect(
      screen
        .getAllByTestId('column-chart-bar')
        .map((bar) => (bar as HTMLElement).style.height)
    ).toEqual(['0%', '25%', '100%']);
  });

  it('should draw empty columns when every value is zero', () => {
    // When
    testRender(
      <ColumnChart
        aria-label="Records per day"
        data={DATA.map((point) => ({ ...point, value: 0 }))}
      />
    );

    // Then
    expect(
      screen
        .getAllByTestId('column-chart-bar')
        .map((bar) => (bar as HTMLElement).style.height)
    ).toEqual(['0%', '0%', '0%']);
  });

  it('should label the two ends of the axis', () => {
    // When
    testRender(
      <ColumnChart
        aria-label="Records per day"
        data={DATA}
      />
    );

    // Then
    expect(screen.getByText('Oct 1')).toBeInTheDocument();
    expect(screen.getByText('Oct 3')).toBeInTheDocument();
    expect(screen.queryByText('Oct 2')).not.toBeInTheDocument();
  });

  it('should describe itself as a data display component', () => {
    // Then
    expect(ColumnChartMeta).toMatchObject({
      name: 'ColumnChart',
      category: 'data-display',
    });
    expect(Object.keys(ColumnChartMeta.props)).toEqual(
      expect.arrayContaining(['data', 'aria-label'])
    );
  });
});
