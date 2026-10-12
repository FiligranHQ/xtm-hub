import type { ComponentMeta } from '@filigran/design-system/meta';

export const ColumnChartMeta: ComponentMeta = {
  name: 'ColumnChart',
  description:
    'A compact vertical bar chart for one series over an ordered axis, typically one column per day. Rebuilt in XTM Hub because the design system ships no chart: a design system candidate. Each column is scaled against the largest value of the series, the first and last labels are drawn under the axis, and every column names its own label and value through its accessible name and a tooltip.',
  status: 'beta',
  category: 'data-display',
  version: '0.1.0',
  radixPrimitive: '@radix-ui/react-tooltip (through the design system Tooltip)',
  examples: [
    `<ColumnChart
  aria-label="Records received per day"
  data={days.map((day) => ({ key: day.day, label: day.day, value: day.records }))}
  formatValue={(value) => format.number(value)}
/>`,
  ],
  accessibility: {
    wcag: '2.1 AA',
    wcagStatus: 'pending',
    contrastPairs: [
      {
        id: 'column against the surface',
        fg: '--color-filigran-brand-primary',
        bg: '--bg-elevation-default-layer-1',
        minRatio: 3,
      },
    ],
    notes:
      'The figure carries the accessible name of the chart, each column is a list item whose accessible name is "label: value", so the series is readable without the graphics. Columns are not focusable: the values are reachable in browse mode, and the tooltip only repeats them on hover. Colour is never the only cue: the height carries the value and the name states it.',
  },
  variants: ['default'],
  sizes: [],
  props: {
    data: 'ColumnChartPoint[] (required) - { key, label, value } per column, in axis order. Negative values draw as empty columns.',
    'aria-label': 'string (required) - names the series the chart draws.',
    formatValue:
      '(value: number) => string - formats a value in the accessible name and the tooltip. Default String.',
    className:
      'string - merged on the figure. The parent owns the width; the plot is 10rem high.',
  },
};
