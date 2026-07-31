import { cn } from '@/lib/utils';

interface TimelineCountBadgeProps {
  count: number;
  bgFadedClass: string;
  textClass: string;
  className?: string;
}

export const TimelineCountBadge = ({
  count,
  bgFadedClass,
  textClass,
  className,
}: TimelineCountBadgeProps) => (
  <div
    className={cn(
      'rounded-full w-6 h-6 flex items-center justify-center relative shrink-0',
      className
    )}>
    <div className={cn('absolute inset-0 rounded-full', bgFadedClass)} />
    <span className={cn('relative z-10 content-body-base-medium', textClass)}>
      {count}
    </span>
  </div>
);
