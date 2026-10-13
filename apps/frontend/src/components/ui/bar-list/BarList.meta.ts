import type { ComponentMeta } from '@filigran/design-system/meta';

export const BarListMeta: ComponentMeta = {
  name: 'BarList',
  description:
    'A ranked list of labelled quantities, each drawn as a horizontal bar scaled against the largest one: a breakdown by category (sector, region, type). Rebuilt in XTM Hub on the design system ProgressBar and Text because the design system ships no chart: a design system candidate. The caller orders the items; the list keeps that order.',
  status: 'beta',
  category: 'data-display',
  version: '0.1.0',
  radixPrimitive: 'none',
  examples: [
    `<BarList
  aria-label="Events by sector"
  items={sectors.map((sector) => ({
    key: sector.bucket,
    label: t(\`Sector.\${sector.bucket}\`),
    value: sector.events,
    detail: t('PlatformCount', { count: sector.platforms }),
  }))}
  formatValue={(value) => format.number(value)}
  emptyLabel={t('NoData')}
/>`,
  ],
  accessibility: {
    wcag: '2.1 AA',
    wcagStatus: 'pending',
    contrastPairs: [],
    notes:
      'Every bar is a design system ProgressBar named by the visible label of its row through aria-labelledby, so the contrast of the bar is the one ProgressBar declares. The value is always printed as text beside the label: the bar length only reinforces it. The list carries the accessible name of the breakdown.',
  },
  variants: ['default', 'empty'],
  sizes: [],
  props: {
    items:
      'BarListItem[] (required) - { key, label, value, detail? } per row, in display order. detail is a secondary text printed after the value.',
    'aria-label': 'string (required) - names the breakdown.',
    formatValue:
      '(value: number) => string - formats the printed value. Default String.',
    emptyLabel:
      'string - text shown instead of the list when items is empty. Nothing is rendered without it.',
    className: 'string - merged on the list.',
  },
};
