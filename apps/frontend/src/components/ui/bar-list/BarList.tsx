'use client';

import { cn } from '@/lib/utils';
import { ProgressBar, Text } from '@filigran/design-system';
import { useId } from 'react';

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  detail?: string;
}

export interface BarListProps {
  items: BarListItem[];
  'aria-label': string;
  formatValue?: (value: number) => string;
  emptyLabel?: string;
  className?: string;
}

const percentOf = (value: number, max: number): number =>
  max > 0 ? (value / max) * 100 : 0;

export const BarList = ({
  items,
  'aria-label': ariaLabel,
  formatValue = String,
  emptyLabel,
  className,
}: BarListProps) => {
  const id = useId();
  const max = Math.max(0, ...items.map(({ value }) => value));

  if (items.length === 0) {
    return emptyLabel ? (
      <Text
        variant="content-compact"
        className={cn('text-text-default-secondary', className)}>
        {emptyLabel}
      </Text>
    ) : null;
  }

  return (
    <ul
      aria-label={ariaLabel}
      className={cn('flex min-w-0 flex-col gap-m', className)}>
      {items.map((item, index) => {
        const labelId = `${id}-${index}`;
        return (
          <li
            key={item.key}
            className="flex min-w-0 flex-col gap-xs">
            <div className="flex min-w-0 items-baseline justify-between gap-s">
              <Text
                id={labelId}
                variant="content-compact"
                className="truncate text-text-default-primary">
                {item.label}
              </Text>
              <Text
                variant="content-compact-medium"
                className="shrink-0 text-text-default-primary">
                {formatValue(item.value)}
                {item.detail && (
                  <span className="text-text-default-secondary">
                    {' '}
                    {item.detail}
                  </span>
                )}
              </Text>
            </div>
            <ProgressBar
              value={percentOf(item.value, max)}
              aria-labelledby={labelId}
            />
          </li>
        );
      })}
    </ul>
  );
};
