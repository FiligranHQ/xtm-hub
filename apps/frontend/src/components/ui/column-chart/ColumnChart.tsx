'use client';

import { cn } from '@/lib/utils';
import {
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/design-system';

export interface ColumnChartPoint {
  key: string;
  label: string;
  value: number;
}

export interface ColumnChartProps {
  data: ColumnChartPoint[];
  'aria-label': string;
  formatValue?: (value: number) => string;
  className?: string;
}

const percentOf = (value: number, max: number): number =>
  max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

export const ColumnChart = ({
  data,
  'aria-label': ariaLabel,
  formatValue = String,
  className,
}: ColumnChartProps) => {
  const max = Math.max(0, ...data.map(({ value }) => value));
  const first = data[0];
  const last = data[data.length - 1];

  return (
    <figure
      aria-label={ariaLabel}
      className={cn('flex min-w-0 flex-col gap-s', className)}>
      <TooltipProvider delayDuration={0}>
        <ul className="flex h-40 items-end gap-xxs border-b border-elevation-border-subtle-layer-1">
          {data.map((point) => {
            const description = `${point.label}: ${formatValue(point.value)}`;
            return (
              <Tooltip key={point.key}>
                <TooltipTrigger asChild>
                  <li
                    aria-label={description}
                    className="flex h-full min-w-0 flex-1 items-end hover:bg-elevation-hover">
                    <div
                      data-testid="column-chart-bar"
                      className="w-full rounded-t-sm bg-filigran-brand-primary"
                      style={{ height: `${percentOf(point.value, max)}%` }}
                    />
                  </li>
                </TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            );
          })}
        </ul>
      </TooltipProvider>
      {first && last && (
        <div
          aria-hidden
          className="flex justify-between gap-s text-text-default-secondary">
          <Text variant="content-caption">{first.label}</Text>
          {last !== first && (
            <Text variant="content-caption">{last.label}</Text>
          )}
        </div>
      )}
    </figure>
  );
};
